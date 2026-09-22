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
