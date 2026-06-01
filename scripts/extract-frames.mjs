#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdir, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

const argv = parseArgs(process.argv.slice(2));

if (argv.help || argv.h) {
  console.log(`extract-frames — wrap ffmpeg into a hero-frame sequence

Required:
  --input <path>      Source video file (mp4 / mov / webm).
  --out <dir>         Output directory; will be created.

Optional:
  --fps <n>           Frames per second (default 30).
  --width <px>        Output width (default 1440).
  --height <px>       Output height (default 810).
  --quality <0-100>   libwebp quality (default 78).
  --start <ts>        Seek start (default 00:00:00).
  --duration <sec>    Clip duration; omit for full length.
  --prefix <s>        Filename prefix (default frame_).
  --pad <n>           Zero-pad width (default 4).
`);
  process.exit(0);
}

const input = argv.input;
const out = argv.out;
if (!input || !out) {
  console.error('extract-frames: --input and --out are required. Use --help for details.');
  process.exit(1);
}

const fps = Number(argv.fps ?? 30);
const width = Number(argv.width ?? 1440);
const height = Number(argv.height ?? 810);
const quality = Number(argv.quality ?? 78);
const start = argv.start ?? '00:00:00';
const duration = argv.duration ? Number(argv.duration) : null;
const prefix = argv.prefix ?? 'frame_';
const pad = Number(argv.pad ?? 4);

const inputPath = resolve(process.cwd(), input);
const outDir = resolve(process.cwd(), out);

try {
  await access(inputPath);
} catch {
  console.error(`extract-frames: input file not found: ${inputPath}`);
  process.exit(1);
}

await mkdir(outDir, { recursive: true });

const pattern = `${prefix}%0${pad}d.webp`;
const outputPattern = resolve(outDir, pattern);

const vf = [
  `fps=${fps}`,
  `scale=${width}:${height}:force_original_aspect_ratio=increase`,
  `crop=${width}:${height}`,
].join(',');

const ffmpegArgs = [
  '-y',
  '-ss', start,
  '-i', inputPath,
];
if (duration !== null && Number.isFinite(duration)) {
  ffmpegArgs.push('-t', String(duration));
}
ffmpegArgs.push(
  '-vf', vf,
  '-c:v', 'libwebp',
  '-quality', String(quality),
  '-lossless', '0',
  '-compression_level', '6',
  '-an',
  '-vsync', '0',
  outputPattern,
);

console.log('extract-frames: spawning ffmpeg');
console.log('  input  :', inputPath);
console.log('  out    :', outputPattern);
console.log('  filter :', vf);

const child = spawn('ffmpeg', ffmpegArgs, { stdio: 'inherit' });
child.on('error', (err) => {
  console.error('extract-frames: failed to spawn ffmpeg.');
  console.error('  Is ffmpeg installed and on PATH? See https://ffmpeg.org');
  console.error('  Original error:', err.message);
  process.exit(1);
});
child.on('close', (code) => {
  if (code === 0) {
    console.log(`extract-frames: done. Output in ${outDir}`);
  } else {
    console.error(`extract-frames: ffmpeg exited with code ${code}`);
  }
  process.exit(code ?? 1);
});
