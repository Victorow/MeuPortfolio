'use client';

import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { resolveTexture, type TextureKey } from './manifest';
import { usePerfTier } from '@/lib/device';

type Opts = { srgb?: boolean; anisotropy?: number };

/** Suspense texture loader that resolves the URL by performance tier. */
export function useTex(key: TextureKey, opts: Opts = {}): THREE.Texture {
  const tier = usePerfTier();
  const url = resolveTexture(key, tier);
  const tex = useLoader(THREE.TextureLoader, url);
  tex.colorSpace = opts.srgb === false ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  tex.anisotropy = opts.anisotropy ?? 8;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

export function useTexUrl(key: TextureKey): string {
  const tier = usePerfTier();
  return resolveTexture(key, tier);
}
