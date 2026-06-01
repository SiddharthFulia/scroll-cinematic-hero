export interface FramePathArgs {
  basePath: string;
  filePrefix: string;
  padWidth: number;
  fileExt: string;
  index: number;
}

export function framePath(args: FramePathArgs): string {
  const { basePath, filePrefix, padWidth, fileExt, index } = args;
  if (!Number.isFinite(index) || index < 1) {
    throw new RangeError(`framePath: index must be >= 1, got ${index}`);
  }
  const padded = String(Math.floor(index)).padStart(padWidth, '0');
  const cleanBase = basePath.replace(/\/+$/, '');
  return `${cleanBase}/${filePrefix}${padded}.${fileExt}`;
}

export function padIndex(index: number, width: number): string {
  return String(Math.floor(index)).padStart(width, '0');
}
