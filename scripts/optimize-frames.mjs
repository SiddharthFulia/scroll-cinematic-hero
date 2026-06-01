#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdir, readdir, stat } from 'node:fs/promises';
import { resolve, join, extname, basename } from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) args[key] = true;
    else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

const argv = parseArgs(process.argv.slice(2));

if (argv.help || argv.h) {
  console.log(`optimize-frames — re-encode an existing WebP sequence at a target quality

Required:
  --dir <path>       Source directory.

Optional:
  --out <path>       Destination directory (default: same as --dir).
  --quality <0-100>  libwebp quality (default 68).
`);
  process.exit(0);
}

const dirArg = argv.dir;
if (!dirArg) {
  console.error('optimize-frames: --dir is required. Use --help for details.');
  process.exit(1);
}

const srcDir = resolve(process.cwd(), dirArg);
const outDir = argv.out ? resolve(process.cwd(), argv.out) : srcDir;
const quality = Number(argv.quality ?? 68);

try {
  const st = await stat(srcDir);
  if (!st.isDirectory()) throw new Error('not a directory');
} catch (err) {
  console.error(`optimize-frames: cannot read ${srcDir}: ${err.message}`);
  process.exit(1);
}
await mkdir(outDir, { recursive: true });

const files = (await readdir(srcDir))
  .filter((f) => extname(f).toLowerCase() === '.webp')
  .sort();

if (files.length === 0) {
  console.error(`optimize-frames: no .webp files found in ${srcDir}`);
  process.exit(1);
}

console.log(`optimize-frames: re-encoding ${files.length} frames at q=${quality}`);

let i = 0;
const concurrency = 4;

async function encodeOne(file) {
  const inputPath = join(srcDir, file);
  const outputPath = join(outDir, file);
  await new Promise((resolveP, rejectP) => {
    const child = spawn(
      'ffmpeg',
      [
        '-y',
        '-i', inputPath,
        '-c:v', 'libwebp',
        '-quality', String(quality),
        '-compression_level', '6',
        '-lossless', '0',
        outputPath,
      ],
      { stdio: ['ignore', 'ignore', 'ignore'] },
    );
    child.on('error', rejectP);
    child.on('close', (code) => (code === 0 ? resolveP() : rejectP(new Error(`ffmpeg ${code}`))));
  });
  i++;
  if (i % 10 === 0 || i === files.length) {
    process.stdout.write(`  ${i}/${files.length}\r`);
  }
}

async function pool(tasks, n) {
  const queue = tasks.slice();
  const runners = Array.from({ length: n }, async () => {
    while (queue.length) {
      const t = queue.shift();
      if (t) {
        try {
          await encodeOne(t);
        } catch (err) {
          console.error(`\noptimize-frames: failed on ${basename(t)}: ${err.message}`);
        }
      }
    }
  });
  await Promise.all(runners);
}

await pool(files, concurrency);
console.log(`\noptimize-frames: done. Wrote ${i} frames to ${outDir}`);
