'use client';

import { useEffect, useRef } from 'react';
import { useJourney } from '@/lib/journey/store';
import { CHAPTER_ACCENT } from '@/content/planets';
import { WARP_IN_MS, WARP_OUT_MS } from '@/lib/journey/navigate';

/**
 * Hyperspace jump used for long chapter jumps: star streaks accelerate out of the
 * centre, the frame goes dark at the peak (scroll + camera snap happen there),
 * then the streaks decelerate and dissolve on the new planet.
 */
export default function WarpOverlay() {
  const warping = useJourney((s) => s.warping);
  const canvas = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const start = useRef(0);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = (c.width = Math.round(window.innerWidth * dpr));
    const H = (c.height = Math.round(window.innerHeight * dpr));
    const cx = W / 2;
    const cy = H / 2;
    const total = WARP_IN_MS + WARP_OUT_MS;

    if (!warping) {
      cancelAnimationFrame(raf.current);
      ctx.clearRect(0, 0, W, H);
      return;
    }

    // streaks: angle, radius offset, speed, width
    const N = 260;
    const stars = Array.from({ length: N }, () => ({
      a: Math.random() * Math.PI * 2,
      r: 0.05 + Math.random() * 0.95,
      s: 0.6 + Math.random() * 1.2,
      w: 0.6 + Math.random() * 1.6
    }));
    const accent = CHAPTER_ACCENT[useJourney.getState().chapter];
    start.current = performance.now();

    const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
    const draw = () => {
      const t = Math.min(1, (performance.now() - start.current) / total);
      const peak = WARP_IN_MS / total;
      // intensity rises to the peak then falls
      const k = t < peak ? ease(t / peak) : 1 - ease((t - peak) / (1 - peak));
      ctx.clearRect(0, 0, W, H);
      // darkening
      ctx.fillStyle = `rgba(3,3,5,${Math.min(1, k * 1.15)})`;
      ctx.fillRect(0, 0, W, H);
      // streaks
      const maxLen = Math.hypot(W, H) * 0.55;
      ctx.lineCap = 'round';
      for (const st of stars) {
        const len = maxLen * Math.pow(k, 1.6) * st.s;
        const r0 = st.r * 60 * dpr + len * 0.15;
        const x0 = cx + Math.cos(st.a) * r0;
        const y0 = cy + Math.sin(st.a) * r0;
        const x1 = cx + Math.cos(st.a) * (r0 + len);
        const y1 = cy + Math.sin(st.a) * (r0 + len);
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(0.6, `rgba(255,255,255,${0.55 * k})`);
        g.addColorStop(1, accent);
        ctx.strokeStyle = g;
        ctx.lineWidth = st.w * dpr * (0.5 + k);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
      // core glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 220 * dpr * (0.3 + k));
      glow.addColorStop(0, `rgba(255,255,255,${0.35 * k})`);
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
      if (t < 1) raf.current = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, W, H);
    };
    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [warping]);

  return (
    <canvas
      ref={canvas}
      data-warp
      data-active={warping ? 'true' : 'false'}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[85] h-full w-full"
      style={{ opacity: warping ? 1 : 0, transition: 'opacity 0.25s' }}
    />
  );
}
