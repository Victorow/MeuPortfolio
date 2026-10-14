'use client';

/**
 * No-WebGL fallback for the scene layer: a plain space-black backdrop. Instead of static posters,
 * JourneyShell shows a one-line banner pointing to the classic version (ClassicBanner).
 */
export default function Poster() {
  return <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-[#030305]" data-scene-fallback />;
}
