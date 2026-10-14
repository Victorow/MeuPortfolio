import type { PerfTier } from '@/lib/device';
import type { ChapterId } from '@/content/planets';
import generated from '@/public/textures/manifest.json';

export type TextureKey =
  | 'earth_day'
  | 'earth_night'
  | 'earth_clouds'
  | 'earth_specular'
  | 'earth_normal'
  | 'moon'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'saturn_ring'
  | 'uranus'
  | 'venus'
  | 'neptune'
  | 'sun'
  | 'milkyway'
  | 'galaxy_whirlpool'
  | 'galaxy_pinwheel'
  | 'galaxy_barred'
  | 'nebula_orion'
  | 'nebula_pillars'
  | 'nebula_helix';

export type Manifest = Partial<Record<TextureKey, Partial<Record<PerfTier, string>>>>;

const ORDER: PerfTier[] = ['high', 'mid', 'low'];

/** Resolve a texture URL for a tier, falling back to lower tiers, then higher. */
export function resolveTexture(key: TextureKey, tier: PerfTier, m: Manifest = generated as Manifest): string {
  const entry = m[key];
  if (!entry) throw new Error(`texture ${key} missing from manifest`);
  const start = ORDER.indexOf(tier);
  for (let i = start; i < ORDER.length; i++) {
    const u = entry[ORDER[i]];
    if (u) return u;
  }
  for (let i = start - 1; i >= 0; i--) {
    const u = entry[ORDER[i]];
    if (u) return u;
  }
  throw new Error(`texture ${key} has no tiers`);
}

export const CHAPTER_TEXTURES: Record<ChapterId, TextureKey[]> = {
  earth: ['earth_day', 'earth_night', 'earth_clouds', 'earth_specular', 'earth_normal', 'moon', 'milkyway', 'sun'],
  mars: ['mars'],
  jupiter: ['jupiter'],
  saturn: ['saturn', 'saturn_ring'],
  uranus: ['uranus'],
  venus: ['venus'],
  neptune: ['neptune'],
  deep: []
};

export function chapterPreloadList(c: ChapterId): TextureKey[] {
  return CHAPTER_TEXTURES[c];
}
