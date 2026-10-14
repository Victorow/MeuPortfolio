'use client';

/**
 * Ambient drone + chapter "whoosh", synthesised with Web Audio (no binary assets).
 * Muted by default; the choice is persisted.
 */
const KEY = 'vp:sound';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let drone: { stop: () => void } | null = null;

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

function brownNoise(ac: AudioContext, seconds = 4) {
  const buf = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate);
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
    m.gain.linearRampToValueAtTime(0.28, ac.currentTime + 1.2);
  } else if (ctx && master) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
  }
}

export function whoosh() {
  if (!ctx || !master || master.gain.value < 0.01) return;
  const ac = ctx;
  const src = ac.createBufferSource();
  src.buffer = brownNoise(ac, 1);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 0.8;
  bp.frequency.setValueAtTime(220, ac.currentTime);
  bp.frequency.exponentialRampToValueAtTime(1400, ac.currentTime + 0.35);
  bp.frequency.exponentialRampToValueAtTime(300, ac.currentTime + 0.7);
  const g = ac.createGain();
  g.gain.setValueAtTime(0, ac.currentTime);
  g.gain.linearRampToValueAtTime(0.9, ac.currentTime + 0.12);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.75);
  src.connect(bp).connect(g).connect(master);
  src.start();
  src.stop(ac.currentTime + 0.8);
}
