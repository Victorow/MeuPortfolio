'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type Comet = {
  pos: THREE.Vector3;
  dir: THREE.Vector3;
  speed: number;
  life: number;
  maxLife: number;
  length: number;
};

function randomStart(): Comet {
  const side = Math.random() < 0.5 ? -1 : 1;
  const pos = new THREE.Vector3(
    side * (18 + Math.random() * 6),
    (Math.random() - 0.5) * 12 + 3,
    -4 - Math.random() * 6
  );
  const dir = new THREE.Vector3(-side, -0.25 - Math.random() * 0.2, 0).normalize();
  const speed = 14 + Math.random() * 10;
  const maxLife = 1.6 + Math.random() * 1.2;
  return {
    pos,
    dir,
    speed,
    life: maxLife,
    maxLife,
    length: 2.2 + Math.random() * 2.0
  };
}

export default function Comets({ count = 4 }: { count?: number }) {
  const group = useRef<THREE.Group>(null);
  const comets = useRef<Comet[]>(
    Array.from({ length: count }, () => {
      const c = randomStart();
      // Stagger initial delay so they don't all spawn at once
      c.life = Math.random() * c.maxLife;
      return c;
    })
  );
  const spawnTimer = useRef(0);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(6); // 2 points
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color('#FFFFFF'),
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }),
    []
  );

  const lines = useMemo(() => {
    return Array.from({ length: count }, () => {
      const geom = geometry.clone();
      const line = new THREE.Line(geom, material.clone());
      line.frustumCulled = false;
      return line;
    });
  }, [count, geometry, material]);

  useFrame((_, delta) => {
    if (!group.current) return;
    spawnTimer.current += delta;

    comets.current.forEach((c, i) => {
      c.life -= delta;
      if (c.life <= 0) {
        comets.current[i] = randomStart();
        return;
      }
      c.pos.addScaledVector(c.dir, c.speed * delta);

      const line = lines[i];
      const attr = line.geometry.getAttribute('position') as THREE.BufferAttribute;
      const tail = c.pos.clone().addScaledVector(c.dir, -c.length);
      attr.setXYZ(0, c.pos.x, c.pos.y, c.pos.z);
      attr.setXYZ(1, tail.x, tail.y, tail.z);
      attr.needsUpdate = true;

      const mat = line.material as THREE.LineBasicMaterial;
      // Fade in/out over life
      const t = c.life / c.maxLife;
      const fade = Math.sin(Math.PI * (1 - t));
      mat.opacity = 0.85 * fade;
    });
  });

  return (
    <group ref={group}>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  );
}
