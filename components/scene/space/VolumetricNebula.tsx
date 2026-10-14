'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePerfTier } from '@/lib/device';

/**
 * True volumetric nebula: a sphere whose fragment shader ray-marches 3D fractal
 * noise in object space, accumulating light front-to-back. Real depth, parallax
 * and self-occlusion; drifts and breathes slowly.
 */
const vert = /* glsl */ `
  varying vec3 vObj;
  void main() {
    vObj = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const frag = /* glsl */ `
  precision highp float;
  varying vec3 vObj;
  uniform vec3 uCamObj;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uDensity;
  uniform float uOpacity;
  uniform float uSeed;
  uniform int uSteps;
  uniform vec3 uLightDir;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3) + uSeed);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0, 0, 0)), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.07 + vec3(1.7, 9.2, 3.1);
      a *= 0.5;
    }
    return v;
  }
  // returns density; writes the base noise to n (used for colour)
  float density(vec3 p, out float n) {
    float r = length(p);
    float shell = smoothstep(1.0, 0.3, r);
    vec3 q = p * 2.0 + vec3(0.0, uTime * 0.015, uTime * 0.008);
    n = fbm(q);
    // filaments: a finer single octave carved by the first layer
    float n2 = noise(q * 5.2 + n * 2.0);
    float d = max(0.0, n * 0.8 + n2 * 0.35 - 0.56);
    return d * shell * uDensity;
  }

  void main() {
    vec3 ro = uCamObj;
    vec3 rd = normalize(vObj - ro);
    float b = dot(ro, rd);
    float c = dot(ro, ro) - 1.0;
    float h = b * b - c;
    if (h < 0.0) discard;
    h = sqrt(h);
    float t0 = max(0.0, -b - h);
    float t1 = -b + h;
    float dt = (t1 - t0) / float(uSteps);
    // dithered start hides banding
    float jitter = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    float t = t0 + dt * jitter;
    vec3 col = vec3(0.0);
    float alpha = 0.0;
    for (int i = 0; i < 48; i++) {
      if (i >= uSteps) break;
      vec3 p = ro + rd * t;
      float n;
      float d = density(p, n);
      if (d > 0.001) {
        // cheap self-shadowing: one noise tap towards the light
        float dl = max(0.0, noise(p * 2.0 + uLightDir * 0.25 + vec3(0.0, uTime * 0.015, 0.0)) - 0.5) * uDensity;
        float lit = exp(-dl * 3.0);
        vec3 base = mix(uColorA, uColorB, smoothstep(0.35, 0.7, n));
        base = mix(base, uColorC, smoothstep(0.6, 0.88, n));
        vec3 emit = base * (0.45 + 1.1 * lit);
        float a = 1.0 - exp(-d * dt * 9.0);
        col += (1.0 - alpha) * a * emit;
        alpha += (1.0 - alpha) * a;
        if (alpha > 0.985) break;
      }
      t += dt;
    }
    gl_FragColor = vec4(col * uOpacity, alpha * uOpacity);
  }
`;

type Props = {
  position: [number, number, number];
  radius: number;
  colors: [string, string, string];
  density?: number;
  opacity?: number;
  seed?: number;
  rotation?: [number, number, number];
};

export default function VolumetricNebula({ position, radius, colors, density = 1.0, opacity = 0.9, seed = 0, rotation = [0, 0, 0] }: Props) {
  const tier = usePerfTier();
  const mesh = useRef<THREE.Mesh>(null);
  const inv = useMemo(() => new THREE.Matrix4(), []);
  const camObj = useMemo(() => new THREE.Vector3(), []);

  const uniforms = useMemo(
    () => ({
      uCamObj: { value: new THREE.Vector3() },
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(colors[0]) },
      uColorB: { value: new THREE.Color(colors[1]) },
      uColorC: { value: new THREE.Color(colors[2]) },
      uDensity: { value: density },
      uOpacity: { value: opacity },
      uSeed: { value: seed },
      uSteps: { value: tier === 'high' ? 30 : 18 },
      uLightDir: { value: new THREE.Vector3(-0.6, 0.5, 0.6).normalize() }
    }),
    [colors, density, opacity, seed, tier]
  );

  useFrame((state) => {
    if (!mesh.current) return;
    uniforms.uTime.value = state.clock.elapsedTime;
    inv.copy(mesh.current.matrixWorld).invert();
    camObj.copy(state.camera.position).applyMatrix4(inv);
    uniforms.uCamObj.value.copy(camObj);
  });

  if (tier === 'low') return null;

  return (
    <mesh ref={mesh} position={position} rotation={rotation} scale={radius} renderOrder={-3} frustumCulled={false}>
      <sphereGeometry args={[1, 32, 16]} />
      <shaderMaterial
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest
        side={THREE.BackSide}
        blending={THREE.NormalBlending}
        toneMapped={false}
      />
    </mesh>
  );
}
