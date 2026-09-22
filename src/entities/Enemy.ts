import Phaser from "phaser";
import type { EnemyDefinition } from "../types/Enemy";
import { AIController, type AiDecision } from "../systems/AIController";

const HP_BAR_WIDTH = 34;
const HP_BAR_HEIGHT = 5;

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  def: EnemyDefinition;
  hp: number;
  private ai: AIController;
  private lastDecision: AiDecision = { state: "idle", moveX: 0, moveY: 0, triggerAttack: false };
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private hpBarFill: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, def: EnemyDefinition, textureKey: string) {
    super(scene, x, y, textureKey);
    this.def = def;
    this.hp = def.stats.hp;
    this.ai = new AIController(def.aiProfile);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    (this.body as Phaser.Physics.Arcade.Body).setSize(def.size * 0.8, def.size * 0.8);

    const barY = y - def.size / 2 - 10;
    this.hpBarBg = scene.add
      .rectangle(x, barY, HP_BAR_WIDTH, HP_BAR_HEIGHT, 0x000000, 0.6)
      .setDepth(40);
    this.hpBarFill = scene.add
      .rectangle(x - HP_BAR_WIDTH / 2, barY, HP_BAR_WIDTH, HP_BAR_HEIGHT, 0xdd3333, 1)
      .setOrigin(0, 0.5)
      .setDepth(41);
  }

  update(delta: number, playerX: number, playerY: number): AiDecision {
    const decision = this.ai.update(delta, this.x, this.y, playerX, playerY);
    this.lastDecision = decision;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(decision.moveX * this.def.stats.moveSpeed, decision.moveY * this.def.stats.moveSpeed);

    if (decision.state === "windup") this.setTint(0xffff66).setTintMode(Phaser.TintModes.FILL);
    else this.clearTint();

    const barY = this.y - this.def.size / 2 - 10;
    this.hpBarBg.setPosition(this.x, barY);
    this.hpBarFill.setPosition(this.x - HP_BAR_WIDTH / 2, barY);
    this.hpBarFill.width = HP_BAR_WIDTH * Phaser.Math.Clamp(this.hp / this.def.stats.maxHp, 0, 1);

    return decision;
  }

  get aiState() {
    return this.lastDecision.state;
  }

  takeDamage(amount: number): boolean {
    this.hp = Math.max(0, this.hp - amount);
    this.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
    this.scene.time.delayedCall(60, () => {
      if (this.active) this.clearTint();
    });
    return this.hp <= 0;
  }

  destroy(fromScene?: boolean): void {
    this.hpBarBg.destroy();
    this.hpBarFill.destroy();
    super.destroy(fromScene);
  }
}
