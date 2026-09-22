import Phaser from "phaser";
import type { Character } from "../types/Character";
import { getEffectiveStats } from "../systems/InventorySystem";
import { InputController } from "../systems/InputController";
import { playerPosition } from "../three/playerPosition";

const ATTACK_COOLDOWN_MS = 380;

export class Player extends Phaser.Physics.Arcade.Sprite {
  character: Character;
  facing = { x: 0, y: 1 };
  private attackCooldownRemaining = 0;
  private invulnerableMs = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, character: Character) {
    super(scene, x, y, "tex-player");
    this.character = character;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    (this.body as Phaser.Physics.Arcade.Body).setSize(20, 20);
  }

  update(delta: number, input: InputController): void {
    this.attackCooldownRemaining = Math.max(0, this.attackCooldownRemaining - delta);
    this.invulnerableMs = Math.max(0, this.invulnerableMs - delta);

    const move = input.getMovementVector();
    if (move.x !== 0 || move.y !== 0) this.facing = { ...move };

    const stats = getEffectiveStats(this.character);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(move.x * stats.moveSpeed, move.y * stats.moveSpeed);

    playerPosition.x = this.x;
    playerPosition.y = this.y;
  }

  getAim(input: InputController): { x: number; y: number } {
    return input.getAimVector(this.x, this.y, this.facing);
  }

  canAttack(): boolean {
    return this.attackCooldownRemaining <= 0;
  }

  commitAttack(): void {
    this.attackCooldownRemaining = ATTACK_COOLDOWN_MS;
  }

  isInvulnerable(): boolean {
    return this.invulnerableMs > 0;
  }

  takeDamage(amount: number): void {
    if (this.isInvulnerable()) return;
    this.character.baseStats.hp = Math.max(0, this.character.baseStats.hp - amount);
    this.invulnerableMs = 500;
    this.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
    this.scene.time.delayedCall(80, () => this.clearTint());
  }

  isDead(): boolean {
    return this.character.baseStats.hp <= 0;
  }
}
