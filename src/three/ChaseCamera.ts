import * as THREE from "three";
import { toThreeX, toThreeZ } from "./coords";

export interface ChaseCameraBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/**
 * Fixed-angle "chase" camera: stays at a constant offset above/behind a
 * followed game-space point, lerping toward it each frame (mirroring the
 * feel of Phaser's `cameras.main.startFollow(player, true, 0.12, 0.12)`).
 * The look/follow target is clamped to level bounds so the camera doesn't
 * drift past the edge of the world, since Three has no built-in equivalent
 * of Phaser's `Camera.setBounds`.
 */
export class ChaseCamera {
  private camera: THREE.PerspectiveCamera;
  private offset: THREE.Vector3;
  private lerpFactor: number;
  private bounds: ChaseCameraBounds | null = null;

  constructor(camera: THREE.PerspectiveCamera, offset: THREE.Vector3, lerpFactor = 0.12) {
    this.camera = camera;
    this.offset = offset;
    this.lerpFactor = lerpFactor;
  }

  setBounds(bounds: ChaseCameraBounds): void {
    this.bounds = bounds;
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
