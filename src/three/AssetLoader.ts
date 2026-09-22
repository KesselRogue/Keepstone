import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

interface CachedModel {
  template: THREE.Object3D;
  scale: number;
  baseYOffset: number;
}

const loader = new GLTFLoader();
const cache = new Map<string, CachedModel>();

/**
 * Loads and caches a GLTF/GLB model, computing a uniform scale so its
 * largest horizontal (X/Z) dimension fits `targetSize` Three units (our
 * tile size) — Kenney's kit doesn't document each model's authored scale,
 * so this normalizes empirically from the loaded geometry's own bounding
 * box instead of guessing a fixed factor. Also records the Y offset needed
 * to sit the model's base on the ground (y=0) after scaling. Must be
 * awaited during preload (PreloaderScene) — getModelClone() is
 * synchronous and only returns something once this has resolved.
 */
export async function preloadModel(url: string, targetSize = 1): Promise<void> {
  if (cache.has(url)) return;
  const gltf = await loader.loadAsync(url);
  const template = gltf.scene;

  const box = new THREE.Box3().setFromObject(template);
  const size = new THREE.Vector3();
  box.getSize(size);
  const largestHorizontal = Math.max(size.x, size.z);
  const scale = largestHorizontal > 0 ? targetSize / largestHorizontal : 1;
  const baseYOffset = -box.min.y * scale;

  cache.set(url, { template, scale, baseYOffset });
}

export interface ModelClone {
  object: THREE.Object3D;
  scale: number;
  baseYOffset: number;
}

/** Returns a fresh clone of an already-preloaded model, or null if it
 * hasn't been preloaded yet. */
export function getModelClone(url: string): ModelClone | null {
  const cached = cache.get(url);
  if (!cached) return null;
  return { object: cached.template.clone(true), scale: cached.scale, baseYOffset: cached.baseYOffset };
}
