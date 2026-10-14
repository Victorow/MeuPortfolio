'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { SUN_POSITION } from '@/content/planets';

const vert = /* glsl */ `
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

// Outer shell (BackSide): soft glow that fades out away from the limb and is
// brighter on the sunlit side.
const fragOuter = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vWorldNormal;
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uPower;
  uniform vec3 uSunDir;
  void main() {
    float rim = pow(max(dot(vNormal, vView), 0.0), uPower);
    float lit = clamp(dot(vWorldNormal, uSunDir) * 0.6 + 0.5, 0.05, 1.0);
    float a = rim * uIntensity * lit;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

// Inner rim (FrontSide): thin fresnel haze on the planet edge.
const fragInner = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vWorldNormal;
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uPower;
  uniform vec3 uSunDir;
  void main() {
    float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), uPower);
    float lit = clamp(dot(vWorldNormal, uSunDir) * 0.7 + 0.35, 0.0, 1.0);
    float a = fres * uIntensity * lit;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

type Props = { radius: number; color: string; intensity?: number; power?: number; segments?: number };

export default function Atmosphere({ radius, color, intensity = 0.6, power = 3.0, segments = 64 }: Props) {
  const sunDir = useMemo(() => new THREE.Vector3(...SUN_POSITION).normalize(), []);
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
      uPower: { value: power },
      uSunDir: { value: sunDir }
    }),
    [color, intensity, power, sunDir]
  );
  return (
    <group>
      <mesh>
        <sphereGeometry args={[radius * 1.09, segments, segments / 2]} />
        <shaderMaterial
          vertexShader={vert}
          fragmentShader={fragOuter}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius * 1.006, segments, segments / 2]} />
        <shaderMaterial
          vertexShader={vert}
          fragmentShader={fragInner}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.FrontSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
