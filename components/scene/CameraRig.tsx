'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { sampleCamera, type CameraSample } from '@/lib/journey/cameraPath';
import { useJourney } from '@/lib/journey/store';
import { useReducedMotion, useIsMobile } from '@/lib/device';

/**
 * Samples the camera path at the current journey progress with exponential
 * smoothing and adds cursor parallax (fine pointers only).
 */
export default function CameraRig() {
  const { camera } = useThree();
  const reduced = useReducedMotion();
  const mobile = useIsMobile();

  const target = useRef<CameraSample>({ position: new THREE.Vector3(), lookAt: new THREE.Vector3(), fov: 42 });
  const pos = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());
  const fov = useRef(42);
  const mouse = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });
  const init = useRef(false);

  // Warp jumps ask the rig to snap to the path instead of easing across every planet.
  useEffect(
    () =>
      useJourney.subscribe(
        (s) => s.snapNonce,
        () => {
          init.current = false;
        }
      ),
    []
  );

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame((_, delta) => {
    const { progress, menuOpen, sixtyOpen } = useJourney.getState();
    const t = target.current;
    sampleCamera(progress, t);

    // Mobile (portrait): pull the camera back so the planet fits the narrow frame,
    // and aim lower so the planet sits in the upper half with text below.
    if (mobile) {
      t.position.sub(t.lookAt).multiplyScalar(1.75).add(t.lookAt);
      t.lookAt.y -= 2.2;
    }

    const dt = Math.min(delta, 1 / 20);
    const k = reduced ? 1 : 1 - Math.pow(0.0015, dt);

    if (!init.current) {
      pos.current.copy(t.position);
      look.current.copy(t.lookAt);
      fov.current = t.fov;
      init.current = true;
    } else {
      pos.current.lerp(t.position, k);
      look.current.lerp(t.lookAt, k);
      fov.current += (t.fov - fov.current) * k;
    }

    const finalLook = look.current;

    // Cursor parallax (frozen while the menu is open so the backdrop stays still)
    if (!reduced && !menuOpen && !sixtyOpen) {
      smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * (1 - Math.pow(0.02, dt));
      smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * (1 - Math.pow(0.02, dt));
    }

    const cam = camera as THREE.PerspectiveCamera;
    cam.position.copy(pos.current);
    cam.up.set(0, 1, 0);
    cam.lookAt(finalLook);
    // parallax applied as a small rotation offset so it never changes framing distance
    cam.rotateY(-smoothMouse.current.x * 0.012);
    cam.rotateX(-smoothMouse.current.y * 0.008);
    if (Math.abs(cam.fov - fov.current) > 0.01) {
      cam.fov = fov.current;
      cam.updateProjectionMatrix();
    }
  });

  return null;
}
