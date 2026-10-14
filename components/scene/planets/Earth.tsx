'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANETS, SUN_POSITION } from '@/content/planets';
import { useTex } from '@/lib/assets/useTexture';
import { usePerfTier, useReducedMotion } from '@/lib/device';
import { useJourney } from '@/lib/journey/store';
import Atmosphere from './Atmosphere';
import { useChapterVisible } from './Planet';
import { MOON_SHADOW_GLSL, moonState } from '@/lib/scene/eclipse';

const vert = /* glsl */ `
  attribute vec4 tangent;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vN;
  varying vec3 vT;
  varying vec3 vB;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    vN = normalize(mat3(modelMatrix) * normal);
    vT = normalize(mat3(modelMatrix) * tangent.xyz);
    vB = cross(vN, vT) * tangent.w;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const frag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vN;
  varying vec3 vT;
  varying vec3 vB;
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform sampler2D uClouds;
  uniform sampler2D uSpec;
  uniform sampler2D uNormal;
  uniform vec3 uSunDir;
  uniform vec3 uCamPos;
  uniform float uTime;
  uniform float uExposure;
  uniform float uCloudShadow;
  uniform vec3 uMoonPos;
  uniform float uMoonRadius;
  uniform float uMoonPenumbra;
${MOON_SHADOW_GLSL}

  void main() {
    // normal mapping (subtle, keeps the sphere reading as photographic)
    vec3 nm = texture2D(uNormal, vUv).xyz * 2.0 - 1.0;
    nm.xy *= 0.55;
    vec3 N = normalize(vT * nm.x + vB * nm.y + vN * nm.z);
    vec3 Ng = normalize(vN);
    vec3 L = normalize(uSunDir);
    vec3 V = normalize(uCamPos - vWorldPos);

    float ndl = dot(N, L);
    float ndlG = dot(Ng, L);
    float terminator = smoothstep(-0.10, 0.22, ndlG);

    vec3 day = texture2D(uDay, vUv).rgb;
    vec3 night = texture2D(uNight, vUv).rgb;
    night = pow(night, vec3(1.3)) * vec3(1.0, 0.86, 0.62) * 1.9;

    // clouds drift east slowly; shadow is the cloud layer sampled slightly offset
    vec2 cuv = vUv + vec2(uTime * 0.00055, 0.0);
    float clouds = texture2D(uClouds, cuv).r;
    float cloudShadow = texture2D(uClouds, cuv - vec2(0.0035, -0.0015)).r * uCloudShadow;

    float diffuse = max(ndl, 0.0);
    vec3 lit = day * (0.035 + diffuse * 1.15);
    lit *= 1.0 - cloudShadow * 0.38;

    // ocean specular (sun glint)
    float specMask = texture2D(uSpec, vUv).r;
    vec3 H = normalize(L + V);
    float spec = pow(max(dot(N, H), 0.0), 64.0) * specMask * 0.55 * terminator;
    lit += vec3(1.0, 0.95, 0.85) * spec;

    // cloud layer, lit by the same sun
    vec3 cloudCol = vec3(1.0) * (0.06 + max(dot(Ng, L), 0.0) * 1.05);
    lit = mix(lit, cloudCol, clouds * 0.92);

    // Moon transit: umbra + soft penumbra where the fragment -> Sun ray grazes the Moon
    float eclipse = moonShadow(vWorldPos, L, uMoonPos, uMoonRadius, uMoonPenumbra);
    lit *= 1.0 - eclipse * 0.88;

    // night side: city lights fade under clouds, suppressed where it is day
    vec3 dark = night * (1.0 - clouds * 0.75);

    vec3 col = mix(dark, lit, terminator);

    // limb scattering (blue, day side only)
    float fres = pow(1.0 - max(dot(Ng, V), 0.0), 3.2);
    col += vec3(0.32, 0.56, 1.0) * fres * 0.55 * terminator;
    // twilight band warm tint
    float twilight = smoothstep(-0.18, 0.0, ndlG) * (1.0 - smoothstep(0.0, 0.25, ndlG));
    col += vec3(0.9, 0.45, 0.2) * twilight * 0.12;

    gl_FragColor = vec4(col * uExposure, 1.0);
  }
`;

/**
 * Earth: day/night terminator, city lights, drifting clouds with shadows, ocean
 * glint, limb scattering. Exposure fades in when the preloader hands off.
 */
export default function Earth() {
  const data = PLANETS.earth;
  const tier = usePerfTier();
  const reduced = useReducedMotion();
  const visible = useChapterVisible('earth');

  const day = useTex('earth_day');
  const night = useTex('earth_night');
  const clouds = useTex('earth_clouds', { srgb: false });
  const spec = useTex('earth_specular', { srgb: false });
  const normal = useTex('earth_normal', { srgb: false });

  const geometry = useMemo(() => {
    const segs: [number, number] = tier === 'high' ? [160, 80] : [96, 48];
    const g = new THREE.SphereGeometry(data.radius, segs[0], segs[1]);
    g.computeTangents();
    return g;
  }, [data.radius, tier]);

  const uniforms = useMemo(
    () => ({
      uDay: { value: day },
      uNight: { value: night },
      uClouds: { value: clouds },
      uSpec: { value: spec },
      uNormal: { value: normal },
      uSunDir: { value: new THREE.Vector3(...SUN_POSITION).normalize() },
      uCamPos: { value: new THREE.Vector3() },
      uTime: { value: 0 },
      uExposure: { value: 0 },
      uCloudShadow: { value: tier === 'low' ? 0 : 1 },
      uMoonPos: { value: new THREE.Vector3(1e4, 0, 0) },
      uMoonRadius: { value: 0.5 },
      // tier low: hard-edged shadow, no penumbra
      uMoonPenumbra: { value: tier === 'low' ? 0.02 : 0.45 }
    }),
    [day, night, clouds, spec, normal, tier]
  );

  const mesh = useRef<THREE.Mesh>(null);
  const exposure = useRef(0);
  const ready = useJourney((s) => s.ready);
  const readyAt = useRef<number | null>(null);

  useEffect(() => {
    if (ready && readyAt.current === null) readyAt.current = performance.now();
  }, [ready]);

  useFrame((state, delta) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uCamPos.value.copy(state.camera.position);
    if (readyAt.current !== null) {
      const t = Math.min(1, (performance.now() - readyAt.current) / 1600);
      exposure.current = 1 - Math.pow(1 - t, 3);
    }
    uniforms.uExposure.value = exposure.current;
    uniforms.uMoonPos.value.set(moonState.pos[0], moonState.pos[1], moonState.pos[2]);
    uniforms.uMoonRadius.value = moonState.radius;
    if (mesh.current && !reduced) mesh.current.rotation.y += (delta * Math.PI * 2) / data.rotationPeriod;
  });

  return (
    <group position={data.position} rotation={[0, 0, THREE.MathUtils.degToRad(data.axialTilt)]} visible={visible}>
      <mesh ref={mesh} geometry={geometry} rotation={[0, Math.PI * 1.15, 0]}>
        <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={uniforms} />
      </mesh>
      <Atmosphere radius={data.radius} color="#5FA8FF" intensity={0.95} power={3.2} segments={96} />
    </group>
  );
}
