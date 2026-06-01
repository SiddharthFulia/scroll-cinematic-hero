import '@testing-library/jest-dom';

// jsdom doesn't ship ResizeObserver
if (typeof (globalThis as any).ResizeObserver === 'undefined') {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

const rafQueue: FrameRequestCallback[] = [];
let rafId = 0;

(globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => {
  rafId += 1;
  rafQueue.push(cb);
  return rafId;
};

(globalThis as any).cancelAnimationFrame = (_id: number) => {};

(globalThis as any).__flushRaf = () => {
  const q = rafQueue.splice(0);
  for (const cb of q) cb(performance.now());
};

if (typeof HTMLCanvasElement !== 'undefined') {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: any[]) {
    if (type === '2d') {
      return {
        setTransform: () => {},
        clearRect: () => {},
        drawImage: () => {},
        fillRect: () => {},
        save: () => {},
        restore: () => {},
        scale: () => {},
        canvas: this,
      } as unknown as CanvasRenderingContext2D;
    }
    return original?.call(this, type, ...rest) ?? null;
  } as any;
}
