import Phaser from "phaser";
import { Enemy } from "../Enemy";
import { ENEMY_DEFS } from "../../data/enemies";

export class Warlord extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, ENEMY_DEFS.warlord, "tex-brute");
  }
}
