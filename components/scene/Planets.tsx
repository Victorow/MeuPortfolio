'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* -------------------------------------------------------------------------
 * Deterministic PRNG (mulberry32) + helpers, so SSR and client agree.
 * ----------------------------------------------------------------------- */
function prng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
const GLOBAL_SEED = 0xC05A03; // cosmos seed — change to regenerate universe
const rand = prng(GLOBAL_SEED);
function rr(min: number, max: number) {
  return min + rand() * (max - min);
}
function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

/* -------------------------------------------------------------------------
 * Unified procedural planet shader — one pipeline, 3 visual modes.
 * uType: 0 = gas giant, 1 = rocky, 2 = frozen
 * ----------------------------------------------------------------------- */
const planetVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vWorldNormal;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const planetFragment = /* glsl */ `
  precision highp float;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vWorldNormal;
  uniform float uTime;
  uniform int uType;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uSeed;
  uniform float uBandFreq;
  uniform float uLightDirX;
  uniform float uLightDirY;
  uniform float uLightDirZ;
  uniform vec3 uLightColor;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 6; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }
  // Worley-ish cell noise for cracks / continents
  float cell(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float minD = 1.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 g = vec2(float(x), float(y));
        vec2 o = vec2(hash(i + g), hash(i + g + 17.0));
        vec2 r = g + o - f;
        minD = min(minD, dot(r, r));
      }
    }
    return sqrt(minD);
  }

  void main() {
    // Spherical coords from normal
    float lat = vWorldNormal.y;                  // -1..1
    float lon = atan(vWorldNormal.z, vWorldNormal.x); // -pi..pi
    vec2 sph = vec2(lon, lat);
    vec3 col = vec3(0.0);

    if (uType == 0) {
      // --- GAS GIANT: latitudinal bands warped by turbulence ---
      float turb = fbm(vec2(lon * 2.4 + uTime * 0.04 + uSeed, lat * 5.5));
      float bands = sin(lat * uBandFreq + turb * 3.4 + uSeed);
      bands = smoothstep(-0.25, 0.9, bands);
      float streak = fbm(vec2(lon * 4.2 + uTime * 0.06, lat * 22.0 + uSeed * 7.0));
      col = mix(uColorA, uColorB, bands * 0.7);
      col = mix(col, uColorC, smoothstep(0.55, 0.92, streak) * 0.4);
    } else if (uType == 1) {
      // --- ROCKY: fbm elevation, land/ocean split, crater cells ---
      float h = fbm(vec2(lon * 2.0 + uSeed, lat * 3.0 + uSeed));
      float h2 = fbm(vec2(lon * 6.0 + uSeed * 3.0, lat * 8.0));
      float elev = h * 0.65 + h2 * 0.35;
      float land = smoothstep(0.48, 0.56, elev);
      float ridges = fbm(vec2(lon * 12.0 + uSeed, lat * 14.0)) * land;
      float craters = 1.0 - smoothstep(0.0, 0.12, cell(vec2(lon * 7.0, lat * 9.0)));

      // Ocean / lowland mix
      vec3 ocean = mix(uColorA, uColorA * 0.75, h2);
      vec3 surface = mix(uColorB, uColorC, smoothstep(0.2, 0.9, ridges));
      col = mix(ocean, surface, land);
      col = mix(col, uColorC * 1.15, craters * 0.35 * land);
    } else {
      // --- FROZEN: bright base + sharp fractures + latitudinal snow bands ---
      float crack = 1.0 - smoothstep(0.0, 0.06, cell(vec2(lon * 3.5 + uSeed, lat * 4.5)));
      float sheen = fbm(vec2(lon * 5.0, lat * 5.0 + uSeed));
      float snow = smoothstep(0.2, 0.9, 1.0 - abs(lat)); // polar caps reversed (more toward equator? invert)
      snow = 0.3 + 0.7 * (1.0 - snow); // strong caps
      vec3 ice = mix(uColorA, uColorB, sheen * 0.8);
      ice = mix(ice, uColorC, snow * 0.45);
      ice = mix(ice, vec3(1.0), crack * 0.55);
      col = ice;
    }

    // Lighting — soft diffuse from uLightDir with provided color
    vec3 L = normalize(vec3(uLightDirX, uLightDirY, uLightDirZ));
    float diff = max(dot(normalize(vWorldNormal), L), 0.0);
    float ambient = uType == 2 ? 0.28 : 0.18; // icy worlds pick up more scatter
    col *= (ambient + diff * 1.05) * uLightColor;

    // Fresnel rim — stronger on frozen, soft on gas
    float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), uType == 2 ? 2.0 : 2.6);
    col += fres * (uType == 2 ? 0.55 : 0.35) * uColorC;

    // Keep within cinematic range
    col = clamp(col, 0.0, 1.4);
    gl_FragColor = vec4(col, 1.0);
  }
`;

/* -------------------------------------------------------------------------
 * Atmosphere halo (shared)
 * ----------------------------------------------------------------------- */
const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const atmosphereFragment = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  uniform float uIntensity;
  uniform vec3 uColor;
  void main() {
    float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.4);
    gl_FragColor = vec4(uColor * fres * uIntensity, fres * uIntensity);
  }
`;

function TintedAtmosphere({
  radius,
  intensity,
  color
}: {
  radius: number;
  intensity: number;
  color: string;
}) {
  const uniforms = useMemo(
    () => ({
      uIntensity: { value: intensity },
      uColor: { value: new THREE.Color(color) }
    }),
    [intensity, color]
  );
  return (
    <mesh>
      <sphereGeometry args={[radius * 1.07, 48, 48]} />
      <shaderMaterial
        vertexShader={atmosphereVertex}
        fragmentShader={atmosphereFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* -------------------------------------------------------------------------
 * Palettes per planet type: [base, mid, highlight]
 * ----------------------------------------------------------------------- */
type Palette = [string, string, string];

const GAS_PALETTES: Palette[] = [
  ['#3B4A5E', '#7A8CA0', '#C7D3E2'], // slate-blue
  ['#5C4A3A', '#A68458', '#E6CFA8'], // dusty gold
  ['#2F4A46', '#5E8C82', '#B8D9CF'], // faded teal
  ['#4A3E5A', '#8A7BA8', '#D4C7E6'], // muted amethyst
  ['#5A4438', '#A57560', '#E8C9B3'], // warm sand
  ['#2E3A4A', '#5F7999', '#B4C7DE'], // cold steel-blue
  ['#6A4A3E', '#B8876B', '#F2D2B8'], // copper
  ['#3D4A3B', '#7A9570', '#C8DEB8']  // sage
];

const ROCKY_PALETTES: Palette[] = [
  ['#1E2A33', '#6B5A4A', '#C7B39A'], // earth-like
  ['#2A1F1C', '#6E3E2E', '#D9A17A'], // mars rust
  ['#1A1A1E', '#4A4846', '#A8A59E'], // lunar grey
  ['#2A2530', '#5E4F60', '#BFA8C2'], // shadowed violet rock
  ['#1F2A26', '#4F6E5E', '#B9D6C4'], // olivine
  ['#2A2220', '#7E5A42', '#E0BC93']  // sandstone
];

const FROZEN_PALETTES: Palette[] = [
  ['#8AB2C8', '#C8DEED', '#FFFFFF'], // arctic blue
  ['#9BAEBA', '#D2DFE6', '#FFFFFF'], // pale glacier
  ['#A6B9C9', '#D8E1EA', '#F2F7FB'], // mist
  ['#7D9FB8', '#B8D1E2', '#EAF3F9'], // deep ice
  ['#98A9B3', '#CFDCE3', '#FFFFFF']  // silver frost
];

type PlanetType = 'gas' | 'rocky' | 'frozen';

type PlanetConfig = {
  type: PlanetType;
  radius: number;
  position: [number, number, number]; // local position within the Planets group
  axialTilt: [number, number, number];
  selfSpeed: number;
  palette: Palette;
  seed: number;
  bandFreq: number;
  atmosphere: number;
  hasRings: boolean;
  rings?: { inner: number; outer: number; opacity: number };
  hasMoon: boolean;
  moon?: { radius: number; distance: number; speed: number; tilt: number };
  hasSun: boolean;
  sun?: { position: [number, number, number]; radius: number; color: string };
};

/* -------------------------------------------------------------------------
 * Universe generation: scatter planets in a spherical shell, pick types,
 * palettes, sun/moon chances.
 * ----------------------------------------------------------------------- */
const PLANET_TYPE_DIST: PlanetType[] = ['gas', 'gas', 'gas', 'rocky', 'rocky', 'frozen'];
const SUN_CHANCE = 0.28;
const MOON_CHANCE = 0.45;
const RING_CHANCE_BY_TYPE: Record<PlanetType, number> = {
  gas: 0.35,
  rocky: 0.08,
  frozen: 0.18
};

function buildUniverse(): PlanetConfig[] {
  const count = 7;
  const out: PlanetConfig[] = [];

  for (let i = 0; i < count; i++) {
    const type = pickOne(PLANET_TYPE_DIST);
    const palette =
      type === 'gas'
        ? pickOne(GAS_PALETTES)
        : type === 'rocky'
          ? pickOne(ROCKY_PALETTES)
          : pickOne(FROZEN_PALETTES);

    // Scatter in a wide spherical shell around origin, pushed back.
    const r = rr(26, 55);
    const theta = rr(0, Math.PI * 2);
    const phi = Math.acos(rr(-0.75, 0.75)); // keep away from direct poles
    const px = r * Math.sin(phi) * Math.cos(theta);
    const py = r * Math.sin(phi) * Math.sin(theta) * 0.45; // flatter spread vertically
    const pz = r * Math.cos(phi) - 12; // push back into scene

    const radius =
      type === 'gas' ? rr(1.6, 3.4) : type === 'rocky' ? rr(0.8, 1.8) : rr(1.0, 2.2);

    const hasRings = rand() < RING_CHANCE_BY_TYPE[type];
    const hasMoon = rand() < MOON_CHANCE;
    const hasSun = rand() < SUN_CHANCE;

    const cfg: PlanetConfig = {
      type,
      radius,
      position: [px, py, pz],
      axialTilt: [rr(-0.3, 0.3), rr(0, Math.PI * 2), rr(-0.2, 0.2)],
      selfSpeed: rr(0.02, 0.14) * (rand() < 0.5 ? -1 : 1),
      palette,
      seed: rr(0, 100),
      bandFreq: type === 'gas' ? rr(10, 22) : 10,
      atmosphere: type === 'frozen' ? rr(0.55, 0.9) : rr(0.35, 0.7),
      hasRings,
      rings: hasRings
        ? {
            inner: radius * rr(1.4, 1.7),
            outer: radius * rr(1.85, 2.3),
            opacity: rr(0.14, 0.28)
          }
        : undefined,
      hasMoon,
      moon: hasMoon
        ? {
            radius: radius * rr(0.14, 0.26),
            distance: radius * rr(2.2, 3.4),
            speed: rr(0.15, 0.45),
            tilt: rr(-0.4, 0.4)
          }
        : undefined,
      hasSun,
      sun: hasSun
        ? {
            position: [rr(-8, 8), rr(-4, 6), rr(8, 22)],
            radius: rr(0.35, 0.7),
            color: pickOne(['#FFE7B3', '#FFD69A', '#E9F1FF', '#F5E6D4'])
          }
        : undefined
    };

    out.push(cfg);
  }

  return out;
}

// Build once per module load. Seed is fixed → deterministic universe.
const UNIVERSE = buildUniverse();

/* -------------------------------------------------------------------------
 * Planet component — body, atmosphere, optional moon/rings/sun.
 * ----------------------------------------------------------------------- */
function Planet({ config }: { config: PlanetConfig }) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const moonOrbit = useRef<THREE.Group>(null);

  const ringGeom = useMemo(() => {
    if (!config.rings) return null;
    return new THREE.RingGeometry(config.rings.inner, config.rings.outer, 96, 1);
  }, [config.rings]);

  const typeIndex = config.type === 'gas' ? 0 : config.type === 'rocky' ? 1 : 2;

  // If the planet has a dedicated sun, use its color/position as the key light
  // direction (normalized), otherwise fall back to the global directional light.
  const light = useMemo(() => {
    if (config.hasSun && config.sun) {
      const dir = new THREE.Vector3(
        config.sun.position[0],
        config.sun.position[1],
        config.sun.position[2]
      )
        .sub(new THREE.Vector3(...config.position))
        .normalize();
      const color = new THREE.Color(config.sun.color);
      return { dir, color };
    }
    return {
      dir: new THREE.Vector3(0.7, 0.55, 0.9).normalize(),
      color: new THREE.Color('#FFFFFF')
    };
  }, [config.hasSun, config.sun, config.position]);

  const uniforms = useMemo(() => {
    const [a, b, c] = config.palette;
    return {
      uTime: { value: 0 },
      uType: { value: typeIndex },
      uColorA: { value: new THREE.Color(a) },
      uColorB: { value: new THREE.Color(b) },
      uColorC: { value: new THREE.Color(c) },
      uSeed: { value: config.seed },
      uBandFreq: { value: config.bandFreq },
      uLightDirX: { value: light.dir.x },
      uLightDirY: { value: light.dir.y },
      uLightDirZ: { value: light.dir.z },
      uLightColor: { value: light.color }
    };
  }, [config.palette, config.seed, config.bandFreq, typeIndex, light]);

  useFrame((_, delta) => {
    if (matRef.current) {
      (matRef.current.uniforms.uTime.value as number) += delta;
    }
    if (body.current) {
      body.current.rotation.y += delta * config.selfSpeed;
    }
    if (moonOrbit.current && config.moon) {
      moonOrbit.current.rotation.y += delta * config.moon.speed;
    }
  });

  const haloColor = config.palette[2];

  return (
    <group ref={group} position={config.position} rotation={config.axialTilt}>
      {/* Planet body */}
      <mesh ref={body}>
        <sphereGeometry args={[config.radius, 96, 96]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={planetVertex}
          fragmentShader={planetFragment}
          uniforms={uniforms}
        />
      </mesh>

      {/* Atmosphere halo */}
      <TintedAtmosphere
        radius={config.radius}
        intensity={config.atmosphere}
        color={haloColor}
      />

      {/* Rings */}
      {ringGeom && config.rings && (
        <mesh geometry={ringGeom} rotation={[Math.PI / 2.1, 0, 0]}>
          <meshBasicMaterial
            color={haloColor}
            transparent
            opacity={config.rings.opacity}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Moon */}
      {config.moon && (
        <group ref={moonOrbit} rotation={[config.moon.tilt, 0, 0]}>
          <group position={[config.moon.distance, 0, 0]}>
            <mesh>
              <sphereGeometry args={[config.moon.radius, 32, 32]} />
              <meshStandardMaterial
                color="#B0B0B6"
                metalness={0.2}
                roughness={0.85}
              />
            </mesh>
          </group>
        </group>
      )}

      {/* Dedicated sun for this planet (local bright emissive body) */}
      {config.sun && (
        <group position={config.sun.position}>
          {/* Sun core */}
          <mesh>
            <sphereGeometry args={[config.sun.radius, 32, 32]} />
            <meshBasicMaterial color={config.sun.color} />
          </mesh>
          {/* Sun halo */}
          <mesh>
            <sphereGeometry args={[config.sun.radius * 1.8, 32, 32]} />
            <meshBasicMaterial
              color={config.sun.color}
              transparent
              opacity={0.28}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[config.sun.radius * 3.0, 32, 32]} />
            <meshBasicMaterial
              color={config.sun.color}
              transparent
              opacity={0.08}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          {/* Soft point light to locally warm nearby space */}
          <pointLight color={config.sun.color} intensity={0.5} distance={18} decay={2} />
        </group>
      )}
    </group>
  );
}

export default function Planets() {
  return (
    <group>
      {UNIVERSE.map((p, i) => (
        <Planet key={i} config={p} />
      ))}
    </group>
  );
}
