import Phaser from "phaser";
import type { EnemyDefinition } from "../types/Enemy";
import { AIController, type AiDecision } from "../systems/AIController";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  def: EnemyDefinition;
  hp: number;
  private ai: AIController;
  private lastDecision: AiDecision = { state: "idle", moveX: 0, moveY: 0, triggerAttack: false };

  constructor(scene: Phaser.Scene, x: number, y: number, def: EnemyDefinition, textureKey: string) {
    super(scene, x, y, textureKey);
    this.def = def;
    this.hp = def.stats.hp;
    this.ai = new AIController(def.aiProfile);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    (this.body as Phaser.Physics.Arcade.Body).setSize(def.size * 0.8, def.size * 0.8);
  }

  update(delta: number, playerX: number, playerY: number): AiDecision {
    const decision = this.ai.update(delta, this.x, this.y, playerX, playerY);
    this.lastDecision = decision;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(decision.moveX * this.def.stats.moveSpeed, decision.moveY * this.def.stats.moveSpeed);

    if (decision.state === "windup") this.setTint(0xffff66).setTintMode(Phaser.TintModes.FILL);
    else this.clearTint();

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
}
