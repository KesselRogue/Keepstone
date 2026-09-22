/**
 * Live player world position, written by Player.ts every update() and read
 * by the Three.js layer — a minimal, Phaser-free bridge so main.ts doesn't
 * need scene-internal access to the (private) Player instance. Same pattern
 * as systems/touchState.ts: one writer, one reader, no event ceremony
 * needed for a single mutable value.
 */
export const playerPosition = { x: 0, y: 0 };
