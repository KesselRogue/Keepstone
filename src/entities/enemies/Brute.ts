import Phaser from "phaser";
import { Enemy } from "../Enemy";
import { ENEMY_DEFS } from "../../data/enemies";

export class Brute extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, ENEMY_DEFS.brute, "tex-brute");
  }
}
