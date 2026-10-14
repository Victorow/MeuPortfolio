'use client';

import type { ChapterId } from '@/content/planets';
import { WARP_IN_MS, WARP_OUT_MS } from '@/lib/journey/warp';

/**
 * Ambient drone, chapter "whoosh" and the warp signature, synthesised with Web
 * Audio (no binary assets). Muted by default; the choice is persisted. Nothing
 * is created before a user gesture: the context only exists once sound is
 * switched on, which only happens from a click/key handler.
 */
const KEY = 'vp:sound';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let drone: { stop: () => void } | null = null;
let enabled = false;
let lastEvent = '—';

export const MASTER_VOLUME = 0.28;

export function readSoundPref(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function writeSoundPref(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    /* ignore */
  }
}

/** Last sound event played (shown in Mission Control). */
export function getLastSoundEvent() {
  return lastEvent;
}

export function isSoundEnabled() {
  return enabled;
}

function ensureCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return { ctx, master: master! };
}

function brownNoise(ac: BaseAudioContext, seconds = 4) {
  const buf = ac.createBuffer(1, Math.max(1, Math.floor(ac.sampleRate * seconds)), ac.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    d[i] = last * 3.5;
  }
  return buf;
}

function startDrone() {
  const { ctx: ac, master: m } = ensureCtx();
  if (drone) return;
  const src = ac.createBufferSource();
  src.buffer = brownNoise(ac);
  src.loop = true;
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 160;
  const lfo = ac.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 60;
  lfo.connect(lfoGain).connect(lp.frequency);
  const g = ac.createGain();
  g.gain.value = 0.55;
  // a very low sine pad adds body
  const pad = ac.createOscillator();
  pad.type = 'sine';
  pad.frequency.value = 48;
  const padGain = ac.createGain();
  padGain.gain.value = 0.08;
  src.connect(lp).connect(g).connect(m);
  pad.connect(padGain).connect(m);
  src.start();
  lfo.start();
  pad.start();
  drone = {
    stop: () => {
      src.stop();
      lfo.stop();
      pad.stop();
    }
  };
}

export function setSound(on: boolean) {
  if (typeof window === 'undefined') return;
  if (on) {
    startDrone();
    const { ctx: ac, master: m } = ensureCtx();
    m.gain.cancelScheduledValues(ac.currentTime);
    m.gain.linearRampToValueAtTime(MASTER_VOLUME, ac.currentTime + 1.2);
    enabled = true;
  } else if (ctx && master) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    enabled = false;
  } else {
    enabled = false;
  }
}

/** Per-planet whoosh pitch: Jupiter lowest, Venus highest. */
export const WHOOSH_PITCH: Record<ChapterId, number> = {
  jupiter: 0.62,
  saturn: 0.72,
  neptune: 0.82,
  uranus: 0.9,
  deep: 0.95,
  earth: 1,
  mars: 1.12,
  venus: 1.32
};

export function whoosh(chapter: ChapterId = 'earth') {
  if (!enabled || !ctx || !master) return;
  const ac = ctx;
  const k = WHOOSH_PITCH[chapter] ?? 1;
  const t = ac.currentTime;
  const src = ac.createBufferSource();
  src.buffer = brownNoise(ac, 1);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 0.8;
  bp.frequency.setValueAtTime(220 * k, t);
  bp.frequency.exponentialRampToValueAtTime(1400 * k, t + 0.35);
  bp.frequency.exponentialRampToValueAtTime(300 * k, t + 0.7);
  const g = ac.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.9, t + 0.12);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
  src.connect(bp).connect(g).connect(master);
  src.start(t);
  src.stop(t + 0.8);
  lastEvent = `whoosh ${chapter}`;
}

/** Dry, very quiet click (60s overlay, menu). */
export function click() {
  if (!enabled || !ctx || !master) return;
  const ac = ctx;
  const t = ac.currentTime;
  const o = ac.createOscillator();
  o.type = 'square';
  o.frequency.setValueAtTime(2400, t);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.06, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 0.04);
  lastEvent = 'click';
}

export type WarpSchedule = {
  /** Peak time (scroll + camera snap), seconds on the context clock. */
  peak: number;
  end: number;
};

/**
 * Schedule the warp signature on `ac`'s clock, starting at `t0`:
 *  - sub-bass sine 55 → 110 Hz over the warp-in, then 110 → 40 Hz over the warp-out;
 *  - filtered noise swell rising towards the peak;
 *  - 1.2 kHz beacon ping exactly at the peak (0.4 s decay) plus a short echo.
 * Pure with respect to its inputs, so it can be tested with a mocked context.
 */
export function scheduleWarp(
  ac: BaseAudioContext,
  dest: AudioNode,
  t0: number,
  inS = WARP_IN_MS / 1000,
  outS = WARP_OUT_MS / 1000,
  noise?: AudioBuffer
): WarpSchedule {
  const peak = t0 + inS;
  const end = peak + outS;

  // sub-bass sweep
  const sub = ac.createOscillator();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(55, t0);
  sub.frequency.exponentialRampToValueAtTime(110, peak);
  sub.frequency.exponentialRampToValueAtTime(40, end);
  const subGain = ac.createGain();
  subGain.gain.setValueAtTime(0.0001, t0);
  subGain.gain.exponentialRampToValueAtTime(0.7, peak);
  subGain.gain.exponentialRampToValueAtTime(0.0001, end);
  sub.connect(subGain).connect(dest);
  sub.start(t0);
  sub.stop(end + 0.05);

  // filtered noise swell (starts ~10% in, swells into the peak, cut right after)
  const nStart = t0 + (inS + outS) * 0.1;
  const src = ac.createBufferSource();
  src.buffer = noise ?? brownNoise(ac, inS + outS);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 0.9;
  bp.frequency.setValueAtTime(240, nStart);
  bp.frequency.exponentialRampToValueAtTime(1800, peak);
  const nGain = ac.createGain();
  nGain.gain.setValueAtTime(0.0001, nStart);
  nGain.gain.exponentialRampToValueAtTime(0.5, peak);
  nGain.gain.exponentialRampToValueAtTime(0.0001, peak + 0.25);
  src.connect(bp).connect(nGain).connect(dest);
  src.start(nStart);
  src.stop(peak + 0.3);

  // beacon ping at the peak + short echo
  const ping = (at: number, level: number, decay: number) => {
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(1200, at);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(level, at + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    o.connect(g).connect(dest);
    o.start(at);
    o.stop(at + decay + 0.02);
  };
  ping(peak, 0.32, 0.4);
  ping(peak + 0.14, 0.1, 0.3);

  return { peak, end };
}

/** Warp sound, in sync with WarpOverlay. No-op unless sound is on (which needs a prior gesture). */
export function playWarp() {
  if (!enabled || !ctx || !master) return;
  scheduleWarp(ctx, master, ctx.currentTime + 0.01);
  lastEvent = 'warp';
}
