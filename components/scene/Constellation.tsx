'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ALL_SKILLS, SKILL_CLUSTER_IDS, type SkillClusterId } from '@/content/skills';
import { PLANETS } from '@/content/planets';
import { useJourney } from '@/lib/journey/store';
import { localProgress } from '@/lib/journey/timeline';
import { useIsMobile, useReducedMotion } from '@/lib/device';
import { useChapterVisible } from './planets/Planet';

function prng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const CENTER = new THREE.Vector3(PLANETS.neptune.position[0] + 11, PLANETS.neptune.position[1] + 1.5, PLANETS.neptune.position[2] + 5);
const RADIUS = 4.2;

type Layout = {
  positions: Float32Array;
  sizes: Float32Array;
  clusterOf: SkillClusterId[];
  names: string[];
  centroids: Record<SkillClusterId, THREE.Vector3>;
  linePositions: Float32Array;
  lineCluster: SkillClusterId[];
};

function buildLayout(): Layout {
  const rnd = prng(20261008);
  const n = ALL_SKILLS.length;
  const positions = new Float32Array(n * 3);
  const sizes = new Float32Array(n);
  const clusterOf: SkillClusterId[] = [];
  const names: string[] = [];
  const centroids = {} as Record<SkillClusterId, THREE.Vector3>;
  const perCluster: Record<SkillClusterId, THREE.Vector3[]> = {
    languages: [], frameworks: [], databases: [], cloud: [], ai: [], methods: []
  };

  SKILL_CLUSTER_IDS.forEach((cid, ci) => {
    const theta = (ci / SKILL_CLUSTER_IDS.length) * Math.PI * 2 + 0.4;
    const phi = Math.PI / 2 + (ci % 2 === 0 ? -0.35 : 0.35);
    centroids[cid] = new THREE.Vector3(
      CENTER.x + Math.cos(theta) * Math.sin(phi) * RADIUS,
      CENTER.y + Math.cos(phi) * RADIUS,
      CENTER.z + Math.sin(theta) * Math.sin(phi) * RADIUS * 0.55
    );
  });

  ALL_SKILLS.forEach((s, i) => {
    const c = centroids[s.cluster];
    const p = new THREE.Vector3(c.x + (rnd() - 0.5) * 2.6, c.y + (rnd() - 0.5) * 2.0, c.z + (rnd() - 0.5) * 1.4);
    positions.set([p.x, p.y, p.z], i * 3);
    sizes[i] = 0.09 + rnd() * 0.07;
    clusterOf.push(s.cluster);
    names.push(s.name);
    perCluster[s.cluster].push(p);
  });

  const segs: number[] = [];
  const lineCluster: SkillClusterId[] = [];
  for (const cid of SKILL_CLUSTER_IDS) {
    const c = centroids[cid];
    for (const p of perCluster[cid]) {
      segs.push(c.x, c.y, c.z, p.x, p.y, p.z);
      lineCluster.push(cid);
    }
  }
  return { positions, sizes, clusterOf, names, centroids, linePositions: new Float32Array(segs), lineCluster };
}

const pointVert = /* glsl */ `
  attribute float aSize;
  attribute float aHot;
  varying float vHot;
  void main() {
    vHot = aHot;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (1.0 + aHot * 1.6) * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const pointFrag = /* glsl */ `
  varying float vHot;
  uniform vec3 uColor;
  uniform vec3 uHotColor;
  uniform float uOpacity;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = length(d);
    float core = smoothstep(0.5, 0.05, r);
    float glow = smoothstep(0.5, 0.0, r) * 0.35;
    vec3 col = mix(uColor, uHotColor, vHot);
    gl_FragColor = vec4(col, (core + glow) * uOpacity);
  }
`;

/**
 * Skills as a constellation near Neptune. The DOM chip list is the source of
 * truth; this only mirrors hover state via the journey store.
 */
export default function Constellation() {
  const mobile = useIsMobile();
  const reduced = useReducedMotion();
  const visible = useChapterVisible('neptune', 0);
  const layout = useMemo(buildLayout, []);
  const hot = useRef(new Float32Array(layout.names.length));
  const lineHot = useRef(new Float32Array(layout.lineCluster.length * 2));
  const hotAttr = useRef<THREE.BufferAttribute>(null);
  const lineHotAttr = useRef<THREE.BufferAttribute>(null);
  const pointMat = useRef<THREE.ShaderMaterial>(null);
  const lineMat = useRef<THREE.ShaderMaterial>(null);

  const pointUniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color('#C9D4FF') }, uHotColor: { value: new THREE.Color('#3E6CFF') }, uOpacity: { value: 0 } }),
    []
  );
  const lineUniforms = useMemo(() => ({ uColor: { value: new THREE.Color('#3E6CFF') }, uOpacity: { value: 0 } }), []);

  useFrame((_, delta) => {
    const { hoveredSkill, progress } = useJourney.getState();
    const lp = localProgress(progress, 'neptune');
    // appear during the second half of the Neptune chapter
    const targetOpacity = THREE.MathUtils.smoothstep(lp, 0.42, 0.7) * (1 - THREE.MathUtils.smoothstep(lp, 0.94, 1));
    pointUniforms.uOpacity.value += (targetOpacity - pointUniforms.uOpacity.value) * (1 - Math.pow(0.01, delta));
    lineUniforms.uOpacity.value = pointUniforms.uOpacity.value * 0.45;

    const k = 1 - Math.pow(0.002, delta);
    const hotCluster = hoveredSkill ? layout.clusterOf[layout.names.indexOf(hoveredSkill)] : null;
    for (let i = 0; i < hot.current.length; i++) {
      const want = hoveredSkill === layout.names[i] ? 1 : hotCluster && layout.clusterOf[i] === hotCluster ? 0.45 : 0;
      hot.current[i] += (want - hot.current[i]) * k;
    }
    for (let i = 0; i < layout.lineCluster.length; i++) {
      const want = hotCluster && layout.lineCluster[i] === hotCluster ? 1 : 0;
      const v = lineHot.current[i * 2] + (want - lineHot.current[i * 2]) * k;
      lineHot.current[i * 2] = v;
      lineHot.current[i * 2 + 1] = v;
    }
    if (hotAttr.current) hotAttr.current.needsUpdate = true;
    if (lineHotAttr.current) lineHotAttr.current.needsUpdate = true;
  });

  if (mobile || reduced) return null;

  return (
    <group visible={visible}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[layout.positions, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[layout.sizes, 1]} />
          <bufferAttribute ref={hotAttr} attach="attributes-aHot" args={[hot.current, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={pointMat}
          vertexShader={pointVert}
          fragmentShader={pointFrag}
          uniforms={pointUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[layout.linePositions, 3]} />
          <bufferAttribute ref={lineHotAttr} attach="attributes-aHot" args={[lineHot.current, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={lineMat}
          vertexShader={/* glsl */ `
            attribute float aHot; varying float vHot;
            void main(){ vHot = aHot; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
          fragmentShader={/* glsl */ `
            varying float vHot; uniform vec3 uColor; uniform float uOpacity;
            void main(){ gl_FragColor = vec4(mix(vec3(0.6,0.65,0.8), uColor, vHot), uOpacity * (0.5 + vHot)); }`}
          uniforms={lineUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}
