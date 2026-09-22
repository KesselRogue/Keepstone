import * as THREE from "three";
import { toThreeX, toThreeZ } from "./coords";

/**
 * Copies a live game-space position (anything with .x/.y — a Phaser Sprite,
 * or the playerPosition bridge) onto a Three.js Object3D every frame.
 */
export class WorldSync {
  private source: { x: number; y: number };
  private target: THREE.Object3D;
  private height: number;

  constructor(source: { x: number; y: number }, target: THREE.Object3D, height = 0) {
    this.source = source;
    this.target = target;
    this.height = height;
  }

  update(): void {
    this.target.position.set(toThreeX(this.source.x), this.height, toThreeZ(this.source.y));
  }
}
