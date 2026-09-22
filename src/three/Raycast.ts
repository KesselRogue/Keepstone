import * as THREE from "three";

const raycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const ndc = new THREE.Vector2();
const hitPoint = new THREE.Vector3();

/**
 * Casts a ray from a screen-space pointer position (Phaser's logical
 * coordinate space) through the camera onto the ground plane (y=0),
 * returning the world-space hit point — replaces Phaser's 2D
 * `camera.getWorldPoint()` for mouse-aim now that the visible camera is a
 * 3D perspective projection, not Phaser's own flat 2D camera.
 */
export function raycastGround(
  pointerX: number,
  pointerY: number,
  logicalWidth: number,
  logicalHeight: number,
  camera: THREE.Camera,
): THREE.Vector3 | null {
  ndc.set((pointerX / logicalWidth) * 2 - 1, -(pointerY / logicalHeight) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  return raycaster.ray.intersectPlane(groundPlane, hitPoint);
}
