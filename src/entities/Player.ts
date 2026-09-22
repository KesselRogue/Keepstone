import Phaser from "phaser";
import type { Character } from "../types/Character";
import { getEffectiveStats } from "../systems/InventorySystem";
import { InputController } from "../systems/InputController";
import { playerPosition } from "../three/playerPosition";
import { threeLayer } from "../three/threeLayer";
import { Billboard } from "../three/Billboard";
import { PLAYER_BILLBOARD } from "../three/themes3D";

const ATTACK_COOLDOWN_MS = 380;

export class Player extends Phaser.Physics.Arcade.Sprite {
  character: Character;
  facing = { x: 0, y: 1 };
  private attackCooldownRemaining = 0;
  private invulnerableMs = 0;
  private billboard: Billboard | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, character: Character) {
    super(scene, x, y, "tex-player");
    this.character = character;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setVisible(false); // the real visual is the Three billboard below
    (this.body as Phaser.Physics.Arcade.Body).setSize(20, 20);

    if (threeLayer.context) {
      this.billboard = new Billboard(playerPosition, PLAYER_BILLBOARD.textureUrl, PLAYER_BILLBOARD.size, PLAYER_BILLBOARD.size);
      threeLayer.context.scene.add(this.billboard.sprite);
    }
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
    this.billboard?.update();
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
    this.billboard?.setTint(0xff6666);
    this.scene.time.delayedCall(80, () => this.billboard?.setTint(null));
  }

  isDead(): boolean {
    return this.character.baseStats.hp <= 0;
  }

  destroy(fromScene?: boolean): void {
    if (this.billboard) threeLayer.context?.scene.remove(this.billboard.sprite);
    super.destroy(fromScene);
  }
}
