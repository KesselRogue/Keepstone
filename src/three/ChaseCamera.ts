import * as THREE from "three";
import { toThreeX, toThreeZ } from "./coords";

export interface ChaseCameraBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

const MIN_ZOOM = 0.55;
const MAX_ZOOM = 2.4;

/**
 * Fixed-angle "chase" camera: stays at a constant offset above/behind a
 * followed game-space point, lerping toward it each frame (mirroring the
 * feel of Phaser's `cameras.main.startFollow(player, true, 0.12, 0.12)`).
 * The look/follow target is clamped to level bounds so the camera doesn't
 * drift past the edge of the world, since Three has no built-in equivalent
 * of Phaser's `Camera.setBounds`.
 *
 * Zoom is a scalar applied to the base offset (dollying the camera along
 * its own view direction) rather than changing FOV, so the viewing angle
 * stays consistent while zoomed in or out.
 */
export class ChaseCamera {
  private camera: THREE.PerspectiveCamera;
  private baseOffset: THREE.Vector3;
  private offset: THREE.Vector3;
  private lerpFactor: number;
  private bounds: ChaseCameraBounds | null = null;
  private zoom = 1;

  constructor(camera: THREE.PerspectiveCamera, offset: THREE.Vector3, lerpFactor = 0.12) {
    this.camera = camera;
    this.baseOffset = offset.clone();
    this.offset = offset.clone();
    this.lerpFactor = lerpFactor;
  }

  setBounds(bounds: ChaseCameraBounds): void {
    this.bounds = bounds;
  }

  /** `delta` > 0 zooms out, < 0 zooms in — scroll wheel deltaY convention. */
  adjustZoom(delta: number): void {
    this.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, this.zoom + delta));
    this.offset.copy(this.baseOffset).multiplyScalar(this.zoom);
  }

  /** Places the camera immediately at the target, skipping the lerp-in. */
  snapTo(gameX: number, gameY: number): void {
    const [tx, tz] = this.clampedTarget(gameX, gameY);
    this.camera.position.set(tx + this.offset.x, this.offset.y, tz + this.offset.z);
    this.camera.lookAt(tx, 0, tz);
  }

  update(gameX: number, gameY: number): void {
    const [tx, tz] = this.clampedTarget(gameX, gameY);
    const desired = new THREE.Vector3(tx + this.offset.x, this.offset.y, tz + this.offset.z);
    this.camera.position.lerp(desired, this.lerpFactor);
    this.camera.lookAt(tx, 0, tz);
  }

  private clampedTarget(gameX: number, gameY: number): [number, number] {
    let tx = toThreeX(gameX);
    let tz = toThreeZ(gameY);
    if (this.bounds) {
      tx = Math.min(Math.max(tx, this.bounds.minX), this.bounds.maxX);
      tz = Math.min(Math.max(tz, this.bounds.minZ), this.bounds.maxZ);
    }
    return [tx, tz];
  }
}
