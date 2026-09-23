import Phaser from "phaser";
import { Enemy } from "./Enemy";
import { Skulker } from "./enemies/Skulker";
import { Brute } from "./enemies/Brute";
import { Reaver } from "./enemies/Reaver";
import { Warlord } from "./enemies/Warlord";

const ENEMY_CLASSES: Record<string, new (scene: Phaser.Scene, x: number, y: number) => Enemy> = {
  skulker: Skulker,
  brute: Brute,
  reaver: Reaver,
  warlord: Warlord,
};

export function createEnemy(scene: Phaser.Scene, x: number, y: number, enemyDefId: string): Enemy {
  const EnemyClass = ENEMY_CLASSES[enemyDefId] ?? Skulker;
  return new EnemyClass(scene, x, y);
}
