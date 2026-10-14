export type PlanetId = 'earth' | 'moon' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'venus' | 'neptune';
export type ChapterId = 'earth' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'venus' | 'neptune' | 'deep';

export type PlanetData = {
  id: PlanetId;
  /** Scene units. Non-realistic scale, relative feel preserved. */
  radius: number;
  /** Degrees. */
  axialTilt: number;
  /** Seconds for one full in-scene rotation. Negative = retrograde. */
  rotationPeriod: number;
  position: [number, number, number];
  accent: string;
  rings?: { inner: number; outer: number; map: 'saturn_ring' | 'uranus_ring' };
};

export const PLANETS: Record<PlanetId, PlanetData> = {
  earth: { id: 'earth', radius: 2.0, axialTilt: 23.4, rotationPeriod: 240, position: [0, 0, 0], accent: '#5FA8FF' },
  moon: { id: 'moon', radius: 0.5, axialTilt: 6.7, rotationPeriod: 600, position: [-7, 2.5, -9], accent: '#C9C9CE' },
  mars: { id: 'mars', radius: 1.4, axialTilt: 25.2, rotationPeriod: 250, position: [30, -2, -40], accent: '#D96A3C' },
  jupiter: { id: 'jupiter', radius: 7.0, axialTilt: 3.1, rotationPeriod: 120, position: [66, 26, -102], accent: '#E0A862' },
  saturn: {
    id: 'saturn',
    radius: 5.5,
    axialTilt: 26.7,
    rotationPeriod: 130,
    position: [115, -4, -150],
    accent: '#E8C98A',
    rings: { inner: 6.8, outer: 11.5, map: 'saturn_ring' }
  },
  uranus: {
    id: 'uranus',
    radius: 3.2,
    axialTilt: 97.8,
    rotationPeriod: 200,
    position: [160, 22, -205],
    accent: '#8FD8E8',
    rings: { inner: 4.2, outer: 5.6, map: 'uranus_ring' }
  },
  venus: { id: 'venus', radius: 1.9, axialTilt: 177.4, rotationPeriod: -400, position: [200, -18, -250], accent: '#F0D9A0' },
  neptune: { id: 'neptune', radius: 3.0, axialTilt: 28.3, rotationPeriod: 190, position: [240, 6, -305], accent: '#3E6CFF' }
};

export const CHAPTER_ACCENT: Record<ChapterId, string> = {
  earth: '#5FA8FF',
  mars: '#D96A3C',
  jupiter: '#E0A862',
  saturn: '#E8C98A',
  uranus: '#8FD8E8',
  venus: '#F0D9A0',
  neptune: '#3E6CFF',
  deep: '#B8C4FF'
};

/** World-space direction towards the Sun (normalized at use site). */
export const SUN_POSITION: [number, number, number] = [-400, 50, 200];
