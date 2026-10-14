import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { ChapterId } from '@/content/planets';
import { chapterAt } from './timeline';

type JourneyState = {
  progress: number;
  velocity: number;
  chapter: ChapterId;
  menuOpen: boolean;
  /** Chapter hovered inside the menu overlay; camera peeks at it. */
  menuHover: ChapterId | null;
  soundOn: boolean;
  /** Preloader finished; hero reveal may start. */
  ready: boolean;
  hoveredSkill: string | null;
  /** Warp jump in progress (overlay covers the scene). */
  warping: boolean;
  /** Incremented to ask the camera rig to snap to the path instead of easing. */
  snapNonce: number;
  setWarping: (b: boolean) => void;
  requestSnap: () => void;
  setProgress: (p: number, v: number) => void;
  setMenuOpen: (b: boolean) => void;
  setMenuHover: (c: ChapterId | null) => void;
  setSoundOn: (b: boolean) => void;
  setReady: (b: boolean) => void;
  setHoveredSkill: (s: string | null) => void;
};

export const useJourney = create<JourneyState>()(
  subscribeWithSelector((set) => ({
    progress: 0,
    velocity: 0,
    chapter: 'earth',
    menuOpen: false,
    menuHover: null,
    soundOn: false,
    ready: false,
    hoveredSkill: null,
    warping: false,
    snapNonce: 0,
    setWarping: (warping) => set({ warping }),
    requestSnap: () => set((st) => ({ snapNonce: st.snapNonce + 1 })),
    setProgress: (p, v) =>
      set((s) => {
        const c = chapterAt(p);
        return c === s.chapter ? { progress: p, velocity: v } : { progress: p, velocity: v, chapter: c };
      }),
    setMenuOpen: (menuOpen) => set({ menuOpen }),
    setMenuHover: (menuHover) => set({ menuHover }),
    setSoundOn: (soundOn) => set({ soundOn }),
    setReady: (ready) => set({ ready }),
    setHoveredSkill: (hoveredSkill) => set({ hoveredSkill })
  }))
);
