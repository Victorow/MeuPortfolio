import { describe, it, expect, vi, afterEach } from 'vitest';
import { scheduleWarp, playWarp, whoosh, WHOOSH_PITCH } from '@/lib/audio';
import { WARP_IN_MS, WARP_OUT_MS } from '@/lib/journey/warp';

type Call = [string, number, number?];

function param() {
  const calls: Call[] = [];
  return {
    value: 0,
    calls,
    setValueAtTime: (v: number, t: number) => calls.push(['set', v, t]),
    linearRampToValueAtTime: (v: number, t: number) => calls.push(['lin', v, t]),
    exponentialRampToValueAtTime: (v: number, t: number) => calls.push(['exp', v, t])
  };
}

function node(extra: Record<string, unknown>) {
  const n = {
    ...extra,
    connections: [] as unknown[],
    starts: [] as number[],
    stops: [] as number[],
    connect(to: unknown) {
      n.connections.push(to);
      return to;
    },
    start(t = 0) {
      n.starts.push(t);
    },
    stop(t = 0) {
      n.stops.push(t);
    }
  };
  return n;
}

function mockContext() {
  const created = { osc: [] as any[], gain: [] as any[], filter: [] as any[], source: [] as any[] };
  const ac = {
    currentTime: 10,
    sampleRate: 48000,
    createOscillator: () => {
      const o = node({ type: 'sine', frequency: param(), detune: param() });
      created.osc.push(o);
      return o;
    },
    createGain: () => {
      const g = node({ gain: param() });
      created.gain.push(g);
      return g;
    },
    createBiquadFilter: () => {
      const f = node({ type: 'lowpass', frequency: param(), Q: param() });
      created.filter.push(f);
      return f;
    },
    createBufferSource: () => {
      const s = node({ buffer: null });
      created.source.push(s);
      return s;
    }
  };
  return { ac, created };
}

const IN = WARP_IN_MS / 1000;
const OUT = WARP_OUT_MS / 1000;

describe('scheduleWarp', () => {
  it('creates the sub-bass, noise and two pings, all routed to the destination', () => {
    const { ac, created } = mockContext();
    const dest = { name: 'dest' };
    scheduleWarp(ac as unknown as BaseAudioContext, dest as unknown as AudioNode, 10, IN, OUT, {} as AudioBuffer);
    expect(created.osc).toHaveLength(3); // sub + ping + echo
    expect(created.source).toHaveLength(1);
    expect(created.filter).toHaveLength(1);
    expect(created.gain).toHaveLength(4);
    for (const g of created.gain) expect(g.connections).toContain(dest);
  });

  it('sweeps the sub-bass 55 → 110 Hz to the peak, then 110 → 40 Hz to the end', () => {
    const { ac, created } = mockContext();
    const { peak, end } = scheduleWarp(ac as unknown as BaseAudioContext, {} as AudioNode, 10, IN, OUT, {} as AudioBuffer);
    expect(peak).toBeCloseTo(10 + IN);
    expect(end).toBeCloseTo(10 + IN + OUT);
    const sub = created.osc[0];
    expect(sub.frequency.calls).toEqual([
      ['set', 55, 10],
      ['exp', 110, peak],
      ['exp', 40, end]
    ]);
    expect(sub.starts).toEqual([10]);
    expect(sub.stops[0]).toBeGreaterThanOrEqual(end);
  });

  it('fires the 1.2 kHz beacon exactly at the peak with a 0.4 s decay and a short echo', () => {
    const { ac, created } = mockContext();
    const { peak } = scheduleWarp(ac as unknown as BaseAudioContext, {} as AudioNode, 10, IN, OUT, {} as AudioBuffer);
    const [, ping, echo] = created.osc;
    expect(ping.frequency.calls[0]).toEqual(['set', 1200, peak]);
    expect(ping.starts).toEqual([peak]);
    const pingGain = created.gain.find((g) => g === ping.connections[0]);
    const lastRamp = pingGain.gain.calls[pingGain.gain.calls.length - 1];
    expect(lastRamp[0]).toBe('exp');
    expect(lastRamp[2]).toBeCloseTo(peak + 0.4);
    expect(echo.starts[0]).toBeGreaterThan(peak);
    expect(echo.starts[0]).toBeLessThan(peak + 0.3);
  });

  it('swells the filtered noise into the peak', () => {
    const { ac, created } = mockContext();
    const { peak } = scheduleWarp(ac as unknown as BaseAudioContext, {} as AudioNode, 10, IN, OUT, {} as AudioBuffer);
    const src = created.source[0];
    expect(src.starts[0]).toBeGreaterThan(10);
    expect(src.starts[0]).toBeLessThan(peak);
    const bp = created.filter[0];
    expect(bp.type).toBe('bandpass');
    expect(bp.frequency.calls[bp.frequency.calls.length - 1]).toEqual(['exp', 1800, peak]);
  });
});

describe('sound gating', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('nothing plays (no AudioContext is even created) before sound is switched on', () => {
    const ctor = vi.fn();
    vi.stubGlobal('window', { AudioContext: ctor });
    vi.stubGlobal('AudioContext', ctor);
    playWarp();
    whoosh('venus');
    expect(ctor).not.toHaveBeenCalled();
  });

  it('whoosh pitch: Jupiter lowest, Venus highest', () => {
    const values = Object.values(WHOOSH_PITCH);
    expect(WHOOSH_PITCH.jupiter).toBe(Math.min(...values));
    expect(WHOOSH_PITCH.venus).toBe(Math.max(...values));
  });
});
