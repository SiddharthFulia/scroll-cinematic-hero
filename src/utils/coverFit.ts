export interface CoverFitResult {
  drawX: number;
  drawY: number;
  drawW: number;
  drawH: number;
  scale: number;
}

export function coverFit(
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number,
): CoverFitResult {
  if (srcW <= 0 || srcH <= 0 || dstW <= 0 || dstH <= 0) {
    return { drawX: 0, drawY: 0, drawW: 0, drawH: 0, scale: 0 };
  }
  const srcRatio = srcW / srcH;
  const dstRatio = dstW / dstH;

  let drawW: number;
  let drawH: number;
  if (srcRatio > dstRatio) {
    drawH = dstH;
    drawW = dstH * srcRatio;
  } else {
    drawW = dstW;
    drawH = dstW / srcRatio;
  }
  const drawX = (dstW - drawW) / 2;
  const drawY = (dstH - drawH) / 2;
  const scale = drawW / srcW;
  return { drawX, drawY, drawW, drawH, scale };
}

export function containFit(
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number,
): CoverFitResult {
  if (srcW <= 0 || srcH <= 0 || dstW <= 0 || dstH <= 0) {
    return { drawX: 0, drawY: 0, drawW: 0, drawH: 0, scale: 0 };
  }
  const srcRatio = srcW / srcH;
  const dstRatio = dstW / dstH;

  let drawW: number;
  let drawH: number;
  if (srcRatio > dstRatio) {
    drawW = dstW;
    drawH = dstW / srcRatio;
  } else {
    drawH = dstH;
    drawW = dstH * srcRatio;
  }
  const drawX = (dstW - drawW) / 2;
  const drawY = (dstH - drawH) / 2;
  const scale = drawW / srcW;
  return { drawX, drawY, drawW, drawH, scale };
}
