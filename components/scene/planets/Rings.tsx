'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useTex } from '@/lib/assets/useTexture';
import { SUN_POSITION, PLANETS, type PlanetId } from '@/content/planets';

const vert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vLocal;
  void main() {
    vUv = uv;
    vLocal = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Samples the ring strip radially (u) and darkens fragments whose sun ray hits the planet.
const frag = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vLocal;
  uniform sampler2D uMap;
  uniform float uPlanetRadius;
  uniform vec3 uSunDirLocal;
  uniform float uOpacity;
  void main() {
    vec4 c = texture2D(uMap, vec2(vUv.x, 0.5));
    // planet shadow: closest approach of the sun ray (from this point) to the planet centre
    float t = dot(-vLocal, uSunDirLocal);
    float shadow = 0.0;
    if (t > 0.0) {
      vec3 closest = vLocal + uSunDirLocal * t;
      float d = length(closest);
      shadow = 1.0 - smoothstep(uPlanetRadius * 0.96, uPlanetRadius * 1.04, d);
    }
    // lit side vs. back-lit: rings are translucent, so give the unlit face a bit of forward scatter
    float facing = abs(uSunDirLocal.y);
    float light = mix(0.35, 1.0, facing);
    vec3 col = c.rgb * light * (1.0 - shadow * 0.88);
    gl_FragColor = vec4(col, c.a * uOpacity);
  }
`;

function buildRingGeometry(inner: number, outer: number) {
  const g = new THREE.RingGeometry(inner, outer, 256, 1);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const r = v.length();
    uv.setXY(i, (r - inner) / (outer - inner), 0.5);
  }
  g.rotateX(-Math.PI / 2); // lie in the XZ plane (planet-local equator)
  return g;
}

function useUranusRingTexture() {
  return useMemo(() => {
    const w = 256;
    const data = new Uint8Array(w * 4);
    for (let i = 0; i < w; i++) {
      const u = i / (w - 1);
      // a few narrow, dark, dusty rings; epsilon ring brighter near the outer edge
      let a = 0.05;
      const bands = [
        [0.08, 0.02, 0.18],
        [0.22, 0.015, 0.14],
        [0.36, 0.02, 0.2],
        [0.52, 0.015, 0.16],
        [0.86, 0.045, 0.75]
      ];
      for (const [c, hw, amp] of bands) a += Math.max(0, 1 - Math.abs(u - c) / hw) * amp;
      const v = 150 + 60 * Math.min(1, a);
      data.set([v, v + 10, v + 20, Math.min(255, a * 255)], i * 4);
    }
    const tex = new THREE.DataTexture(data, w, 1, THREE.RGBAFormat);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

type Props = { planet: PlanetId; opacity?: number };

/** Ring disc in the planet's tilted frame. Renders inside <Planet> as a child. */
export default function Rings({ planet, opacity = 1 }: Props) {
  const data = PLANETS[planet];
  const ring = data.rings!;
  const saturnMap = useTex('saturn_ring');
  const uranusMap = useUranusRingTexture();
  const map = ring.map === 'saturn_ring' ? saturnMap : uranusMap;

  const geometry = useMemo(() => buildRingGeometry(ring.inner, ring.outer), [ring.inner, ring.outer]);

  const sunLocal = useMemo(() => {
    // Direction to the sun expressed in the tilted planet frame (frame rotates by axialTilt around Z).
    const dir = new THREE.Vector3(...SUN_POSITION).sub(new THREE.Vector3(...data.position)).normalize();
    const inv = new THREE.Matrix4().makeRotationZ(-THREE.MathUtils.degToRad(data.axialTilt));
    return dir.applyMatrix4(inv).normalize();
  }, [data.position, data.axialTilt]);

  const uniforms = useMemo(
    () => ({
      uMap: { value: map },
      uPlanetRadius: { value: data.radius },
      uSunDirLocal: { value: sunLocal },
      uOpacity: { value: opacity }
    }),
    [map, data.radius, sunLocal, opacity]
  );

  return (
    <mesh geometry={geometry} renderOrder={2}>
      <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}
