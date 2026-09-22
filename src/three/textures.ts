import * as THREE from "three";

/**
 * Three.js needs its own Texture objects — it can't reuse Phaser's Texture
 * Manager entries even though they load the same underlying PNG files.
 * Cached by URL so repeated calls (e.g. one per enemy spawned) share a
 * single GPU upload.
 */
const loader = new THREE.TextureLoader();
const cache = new Map<string, THREE.Texture>();

export function loadTexture(url: string): THREE.Texture {
  let tex = cache.get(url);
  if (!tex) {
    tex = loader.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.magFilter = THREE.NearestFilter; // crisp pixel art, matching Phaser's pixelArt:true
    tex.minFilter = THREE.NearestFilter;
    cache.set(url, tex);
  }
  return tex;
}
