import * as THREE from "three";

export interface ScreenPoint {
  x: number;
  y: number;
  visible: boolean;
}

const ndc = new THREE.Vector3();

/**
 * Projects a 3D world position through the camera to Phaser's logical
 * coordinate space (gameConfig's configured width/height — NOT the actual
 * CSS-rendered canvas size, since Phaser scales that internally and
 * screen-space GameObjects are positioned in logical coordinates).
 */
export function worldToScreen(
  worldPos: THREE.Vector3,
  camera: THREE.Camera,
  logicalWidth: number,
  logicalHeight: number,
): ScreenPoint {
  ndc.copy(worldPos).project(camera);
  const visible = ndc.z < 1 && ndc.z > -1;
  return {
    x: (ndc.x * 0.5 + 0.5) * logicalWidth,
    y: (1 - (ndc.y * 0.5 + 0.5)) * logicalHeight,
    visible,
  };
}

/**
 * Whether a pointer position (Phaser logical coordinates) is within
 * `radiusPx` of a world point's on-screen projection — used for clicking
 * world-anchored billboards (vendor NPCs, the player avatar). Phaser's own
 * `setInteractive()` hit-testing can't be used for these anymore: it's
 * based on Phaser's own 2D camera, which no longer matches where things
 * actually appear under the 3D perspective camera.
 */
export function isClickNearWorldPoint(
  pointerX: number,
  pointerY: number,
  worldPos: THREE.Vector3,
  camera: THREE.Camera,
  logicalWidth: number,
  logicalHeight: number,
  radiusPx = 26,
): boolean {
  const screen = worldToScreen(worldPos, camera, logicalWidth, logicalHeight);
  return screen.visible && Math.hypot(pointerX - screen.x, pointerY - screen.y) <= radiusPx;
}
