import Phaser from "phaser";
import * as THREE from "three";
import type { EnemyDefinition } from "../types/Enemy";
import { AIController, type AiDecision } from "../systems/AIController";
import { threeLayer } from "../three/threeLayer";
import { Billboard } from "../three/Billboard";
import { worldToScreen } from "../three/Nameplates";
import { toThreeX, toThreeZ, LOGICAL_WIDTH, LOGICAL_HEIGHT } from "../three/coords";
import { BILLBOARD_BY_SPRITE_KIND } from "../three/themes3D";

const HP_BAR_WIDTH = 34;
const HP_BAR_HEIGHT = 5;

const headWorldPos = new THREE.Vector3();

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  def: EnemyDefinition;
  hp: number;
  private ai: AIController;
  private lastDecision: AiDecision = { state: "idle", moveX: 0, moveY: 0, triggerAttack: false };
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private hpBarFill: Phaser.GameObjects.Rectangle;
  private billboard: Billboard | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, def: EnemyDefinition, textureKey: string) {
    super(scene, x, y, textureKey);
    this.def = def;
    this.hp = def.stats.hp;
    this.ai = new AIController(def.aiProfile);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setVisible(false); // the real visual is the Three billboard below
    (this.body as Phaser.Physics.Arcade.Body).setSize(def.size * 0.8, def.size * 0.8);

    this.hpBarBg = scene.add
      .rectangle(x, y, HP_BAR_WIDTH, HP_BAR_HEIGHT, 0x000000, 0.6)
      .setScrollFactor(0)
      .setDepth(40);
    this.hpBarFill = scene.add
      .rectangle(x, y, HP_BAR_WIDTH, HP_BAR_HEIGHT, 0xdd3333, 1)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(41);

    if (threeLayer.context) {
      const spec = BILLBOARD_BY_SPRITE_KIND[def.spriteKind];
      this.billboard = new Billboard(this, spec.textureUrl, spec.size, spec.size);
      this.billboard.setTint(def.tint ?? null);
      threeLayer.context.scene.add(this.billboard.sprite);
      this.billboard.update();
    }
  }

  update(delta: number, playerX: number, playerY: number): AiDecision {
    const decision = this.ai.update(delta, this.x, this.y, playerX, playerY);
    this.lastDecision = decision;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(decision.moveX * this.def.stats.moveSpeed, decision.moveY * this.def.stats.moveSpeed);

    if (this.billboard) {
      this.billboard.update();
      this.billboard.setTint(decision.state === "windup" ? 0xffff66 : (this.def.tint ?? null));
    }

    this.updateHpBarPosition();
    this.hpBarFill.width = HP_BAR_WIDTH * Phaser.Math.Clamp(this.hp / this.def.stats.maxHp, 0, 1);

    return decision;
  }

  private updateHpBarPosition(): void {
    const camera = threeLayer.context?.camera;
    if (!camera || !this.billboard) {
      this.hpBarBg.setVisible(false);
      this.hpBarFill.setVisible(false);
      return;
    }
    headWorldPos.set(toThreeX(this.x), this.billboard.topY + 0.15, toThreeZ(this.y));
    const screen = worldToScreen(headWorldPos, camera, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    this.hpBarBg.setVisible(screen.visible);
    this.hpBarFill.setVisible(screen.visible);
    if (screen.visible) {
      this.hpBarBg.setPosition(screen.x, screen.y);
      this.hpBarFill.setPosition(screen.x - HP_BAR_WIDTH / 2, screen.y);
    }
  }

  get aiState() {
    return this.lastDecision.state;
  }

  takeDamage(amount: number): boolean {
    this.hp = Math.max(0, this.hp - amount);
    this.billboard?.setTint(0xffffff);
    this.scene.time.delayedCall(60, () => {
      if (this.active) this.billboard?.setTint(this.def.tint ?? null);
    });
    return this.hp <= 0;
  }

  destroy(fromScene?: boolean): void {
    this.hpBarBg.destroy();
    this.hpBarFill.destroy();
    if (this.billboard) threeLayer.context?.scene.remove(this.billboard.sprite);
    super.destroy(fromScene);
  }
}
