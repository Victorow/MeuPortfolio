'use client';

import type * as THREE from 'three';

type Composer = { render: (deltaTime?: number) => void; setSize: (w: number, h: number, updateStyle?: boolean) => void };

/**
 * Module-level handle on the R3F renderer so DOM UI (Mission Control, photo
 * mode) can read stats and force a render without living inside the Canvas.
 * Written by SpaceScene's GlProbe and PostFX; read-only everywhere else.
 */
export const glRef: {
  gl: THREE.WebGLRenderer | null;
  scene: THREE.Scene | null;
  camera: THREE.Camera | null;
  composer: Composer | null;
  /** Ring buffer of frame timestamps (ms, performance.now()). */
  frames: Float64Array;
  frameHead: number;
  frameCount: number;
  /** Totals of the previous complete frame (all passes). */
  calls: number;
  triangles: number;
} = {
  gl: null,
  scene: null,
  camera: null,
  composer: null,
  frames: new Float64Array(256),
  frameHead: 0,
  frameCount: 0,
  calls: 0,
  triangles: 0
};

export function recordFrame(now: number) {
  glRef.frames[glRef.frameHead] = now;
  glRef.frameHead = (glRef.frameHead + 1) % glRef.frames.length;
  glRef.frameCount = Math.min(glRef.frames.length, glRef.frameCount + 1);
}

/** Average and minimum FPS over the last `windowMs` of recorded frames. */
export function fpsStats(now: number, windowMs = 1000): { avg: number; min: number } {
  const n = glRef.frameCount;
  const len = glRef.frames.length;
  let newest = -1;
  let oldest = -1;
  let count = 0;
  let maxDelta = 0;
  let prev = -1;
  for (let i = 0; i < n; i++) {
    // walk backwards from the newest sample
    const t = glRef.frames[(glRef.frameHead - 1 - i + len) % len];
    if (now - t > windowMs) break;
    if (newest < 0) newest = t;
    if (prev >= 0) maxDelta = Math.max(maxDelta, prev - t);
    prev = t;
    oldest = t;
    count++;
  }
  if (count < 2 || newest <= oldest) return { avg: 0, min: 0 };
  const avg = ((count - 1) / (newest - oldest)) * 1000;
  return { avg, min: maxDelta > 0 ? 1000 / maxDelta : avg };
}

/** WebGL renderer string (unmasked when the browser exposes it). */
export function rendererString(): string {
  const gl = glRef.gl;
  if (!gl) return '—';
  const ctx = gl.getContext();
  const ext = ctx.getExtension('WEBGL_debug_renderer_info');
  const v = ext ? ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL) : ctx.getParameter(ctx.RENDERER);
  return String(v ?? '—');
}

/**
 * Render one frame at `pixelRatio` (post-processing included) and read it back
 * as a PNG. Everything happens in one task: the drawing buffer is still intact
 * when `toBlob` snapshots it, so `preserveDrawingBuffer` is not needed.
 */
export function captureFrame(pixelRatio = 2): Promise<Blob | null> {
  const { gl, scene, camera, composer } = glRef;
  if (!gl || !scene || !camera) return Promise.resolve(null);
  const canvas = gl.domElement;
  const prevRatio = gl.getPixelRatio();
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;
  const resize = (r: number) => {
    gl.setPixelRatio(r);
    gl.setSize(w, h, false);
    composer?.setSize(w, h, false);
  };
  resize(pixelRatio);
  if (composer) composer.render(0);
  else gl.render(scene, camera);
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png');
    // the snapshot above is synchronous; restore the live resolution right away
    resize(prevRatio);
  });
}
