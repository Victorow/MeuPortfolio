'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uOpacity;

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
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  // Soft radial "cloud patch" at a position p0 with radius r
  float patch(vec2 uv, vec2 p0, float r) {
    float d = length(uv - p0) / r;
    return smoothstep(1.0, 0.0, d);
  }

  void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= 1.6;
    float t = uTime * 0.02;

    // Deep-cosmos noise base (soft & slow)
    float n1 = fbm(uv * 1.6 + vec2(t, -t * 0.6));
    float n2 = fbm(uv * 3.2 - vec2(-t * 0.3, t * 0.8));
    float base = smoothstep(0.32, 0.95, n1 * 0.7 + n2 * 0.5);

    // Three large coloured nebula patches, drifting — desaturated cinematic hues.
    float p1 = patch(uv, vec2(-0.45 + sin(t * 0.6) * 0.06, 0.15 + cos(t * 0.4) * 0.05), 0.55);
    float p2 = patch(uv, vec2(0.35 + cos(t * 0.5) * 0.08, -0.1 + sin(t * 0.3) * 0.06), 0.48);
    float p3 = patch(uv, vec2(0.05 + sin(t * 0.7) * 0.05, 0.35 + cos(t * 0.5) * 0.04), 0.42);

    // Colour palette: deep indigo / muted teal / dusty magenta.
    vec3 cA = vec3(0.35, 0.25, 0.55); // indigo-violet
    vec3 cB = vec3(0.15, 0.42, 0.48); // muted teal
    vec3 cC = vec3(0.55, 0.22, 0.38); // dusty wine

    // Compose: each patch modulated by the noise base so they feel like real gas
    vec3 nebula =
      cA * p1 * mix(0.55, 1.0, n1) +
      cB * p2 * mix(0.55, 1.0, n2) +
      cC * p3 * mix(0.55, 1.0, base);

    // Soft white highlights along dense noise regions
    float highlight = smoothstep(0.8, 1.0, n1 * 0.6 + n2 * 0.6) * 0.25;
    nebula += vec3(0.9, 0.93, 1.0) * highlight;

    // Cinematic radial falloff
    float r = length(uv);
    float falloff = smoothstep(1.1, 0.05, r);

    vec3 col = nebula * falloff;
    // Slight global desaturation blend to keep it premium
    vec3 grey = vec3(dot(col, vec3(0.3, 0.59, 0.11)));
    col = mix(grey * vec3(0.85, 0.9, 1.0), col, 0.75);

    float alpha = (base * falloff * 0.35 + (p1 + p2 + p3) * falloff * 0.55) * uOpacity;
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
  }
`;

export default function Nebula({ opacity = 0.55 }: { opacity?: number }) {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: opacity }
    }),
    [opacity]
  );

  useFrame((_, delta) => {
    if (ref.current) {
      (ref.current.uniforms.uTime.value as number) += delta;
    }
  });

  return (
    <mesh position={[0, 0, -4]}>
      <planeGeometry args={[48, 30, 1, 1]} />
      <shaderMaterial
        ref={ref}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
