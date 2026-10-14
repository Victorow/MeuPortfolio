'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTex } from '@/lib/assets/useTexture';
import type { TextureKey } from '@/lib/assets/manifest';

/**
 * Real deep-sky photograph with 2.5D depth. The photo is split into luminance
 * bands rendered as stacked billboards: bright cores and stars sit nearest the
 * camera, faint dust and background farthest. Head-on it is the untouched photo;
 * as the camera travels, the bands slide against each other (parallax), which
 * reads as volume without altering the image. Additive blending removes the
 * photo's black sky; a soft radial mask hides the frame edge.
 */
const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const frag = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D uMap;
  uniform float uOpacity;
  uniform float uFeather;
  uniform float uLo;
  uniform float uHi;
  uniform float uSoft;
  void main() {
    vec3 c = texture2D(uMap, vUv).rgb;
    float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
    // partition of unity across bands: weights of neighbouring bands sum to 1
    float w = smoothstep(uLo - uSoft, uLo + uSoft, lum) - smoothstep(uHi - uSoft, uHi + uSoft, lum);
    float d = length((vUv - 0.5) * 2.0);
    float mask = 1.0 - smoothstep(uFeather, 1.0, d);
    c = max(c - 0.03, 0.0) * 1.05;
    gl_FragColor = vec4(c * w * mask * uOpacity, 1.0);
  }
`;

// luminance bands, far → near
const BANDS: [number, number][] = [
  [-1.0, 0.14],
  [0.14, 0.32],
  [0.32, 0.58],
  [0.58, 2.0]
];
const SOFT = 0.05;

type Props = {
  map: TextureKey;
  position: [number, number, number];
  size: number;
  aspect?: number;
  rotation?: number;
  opacity?: number;
  feather?: number;
  /** Degrees per second of slow roll around the view axis. */
  spin?: number;
  /** Depth between the farthest and nearest band, as a fraction of size. */
  depth?: number;
};

export default function DeepSky({ map, position, size, aspect = 1, rotation = 0, opacity = 0.8, feather = 0.45, spin = 0, depth = 0.22 }: Props) {
  const tex = useTex(map, { anisotropy: 4 });
  const group = useRef<THREE.Group>(null);

  const layers = useMemo(
    () =>
      BANDS.map(([lo, hi], i) => ({
        z: (i / (BANDS.length - 1)) * depth * size,
        uniforms: {
          uMap: { value: tex },
          uOpacity: { value: opacity },
          uFeather: { value: feather },
          uLo: { value: lo },
          uHi: { value: hi },
          uSoft: { value: SOFT }
        }
      })),
    [tex, opacity, feather, depth, size]
  );

  useFrame((state) => {
    if (!group.current) return;
    // billboard the whole stack, then apply our own roll
    group.current.quaternion.copy(state.camera.quaternion);
    group.current.rotateZ(rotation + (spin ? state.clock.elapsedTime * THREE.MathUtils.degToRad(spin) : 0));
  });

  return (
    <group ref={group} position={position}>
      {layers.map((l, i) => (
        <mesh key={i} position={[0, 0, l.z]} scale={[size * aspect, size, 1]} renderOrder={-5 + i * 0.1} frustumCulled={false}>
          <planeGeometry args={[1, 1]} />
          <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={l.uniforms} transparent depthWrite={false} depthTest blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
