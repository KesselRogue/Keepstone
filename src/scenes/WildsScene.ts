import Phaser from "phaser";
import type { LevelDefinition } from "../types/Level";
import { TOWN_LEVEL } from "../data/levels";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Pickup } from "../entities/Pickup";
import { createEnemy } from "../entities/enemyFactory";
import { InputController } from "../systems/InputController";
import { playerCharacter, persistCharacter } from "../systems/gameState";
import { getEffectiveStats, addItem } from "../systems/InventorySystem";
import { resolveAttack } from "../systems/CombatSystem";
import { grantXp } from "../systems/LevelingSystem";
import { rollDrop } from "../systems/LootSystem";
import { recordKill } from "../systems/QuestSystem";
import { defaultRng } from "../utils/rng";
import {
  buildLevelGeometry,
  createExitZones,
  tileToWorld,
  wireCharacterSheetOpener,
  wireQuestLogOpener,
  WILDS_THEME,
  type ExitZone,
} from "./levelUtils";
import { threeLayer } from "../three/threeLayer";
import { buildLevel3D } from "../three/LevelBuilder";
import type { LevelTheme3D } from "../three/LevelBuilder";

interface SceneEntryData {
  spawnCol?: number;
  spawnRow?: number;
}

const ATTACK_REACH = 42;
const ATTACK_HIT_RADIUS = 34;
const ATTACK_TRIGGER_SLACK = 1.3;

/**
 * Base class for the open wilderness zones outside Keepstone's walls
 * (NorthWildsScene/EastWildsScene/WestWildsScene) — same combat/exit loop as
 * DungeonScene, generalized over which LevelDefinition/theme to load since
 * the three zones differ only in content, not mechanics. No boss/victory
 * banner here — that stays a Dungeon-specific beat.
 */
export class WildsScene extends Phaser.Scene {
  private level: LevelDefinition;
  private theme3D: LevelTheme3D;
  private player!: Player;
  private inputController!: InputController;
  private enemies!: Phaser.Physics.Arcade.Group;
  private pickups!: Phaser.Physics.Arcade.Group;
  private exitZones: ExitZone[] = [];
  private transitioning = false;

  constructor(key: string, level: LevelDefinition, theme3D: LevelTheme3D) {
    super(key);
    this.level = level;
    this.theme3D = theme3D;
  }

  create(data: SceneEntryData): void {
    this.transitioning = false;
    const level = this.level;
    const built = buildLevelGeometry(this, level, WILDS_THEME);
    this.physics.world.setBounds(0, 0, built.widthPx, built.heightPx);
    this.cameras.main.setBounds(0, 0, built.widthPx, built.heightPx);

    const spawnCol = data?.spawnCol ?? level.playerStart.col;
    const spawnRow = data?.spawnRow ?? level.playerStart.row;
    const spawnPos = tileToWorld(level, spawnCol, spawnRow);

    this.player = new Player(this, spawnPos.x, spawnPos.y, playerCharacter);
    this.physics.add.collider(this.player, built.walls);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.inputController = new InputController(this);
    wireCharacterSheetOpener(this, this.player);
    wireQuestLogOpener(this);

    threeLayer.setLevelGroup(buildLevel3D(level, this.theme3D));
    threeLayer.chaseCamera?.setBounds({
      minX: 1,
      maxX: level.grid[0].length - 2,
      minZ: 1,
      maxZ: level.grid.length - 2,
    });
    threeLayer.chaseCamera?.snapTo(spawnPos.x, spawnPos.y);

    this.enemies = this.physics.add.group();
    for (const spawn of level.spawns) {
      const pos = tileToWorld(level, spawn.col, spawn.row);
      const enemy = createEnemy(this, pos.x, pos.y, spawn.enemyDefId);
      this.enemies.add(enemy);
      this.physics.add.collider(enemy, built.walls);
    }
    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.collider(this.player, this.enemies);

    this.pickups = this.physics.add.group();
    this.physics.add.overlap(this.player, this.pickups, (_player, pickup) => this.handlePickup(pickup as Pickup));

    this.exitZones = createExitZones(this, level);
    for (const { zone, exit } of this.exitZones) {
      this.physics.add.overlap(this.player, zone, () => this.handleExit(exit.toScene, exit.toSpawn));
    }
  }

  update(_time: number, delta: number): void {
    if (this.transitioning) return;

    this.player.update(delta, this.inputController);

    if (this.player.canAttack() && this.inputController.isAttackHeld()) {
      this.player.commitAttack();
      this.performPlayerAttack();
    }

    const deadEnemies: Enemy[] = [];
    for (const child of this.enemies.getChildren()) {
      const enemy = child as Enemy;
      if (!enemy.active) continue;
      const decision = enemy.update(delta, this.player.x, this.player.y);
      if (decision.triggerAttack) {
        const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        if (dist <= enemy.def.aiProfile.attackRadius * ATTACK_TRIGGER_SLACK) {
          const result = resolveAttack(enemy.def.stats, getEffectiveStats(this.player.character), defaultRng);
          this.player.takeDamage(result.damage);
        }
      }
      if (enemy.hp <= 0) deadEnemies.push(enemy);
    }
    for (const enemy of deadEnemies) this.handleEnemyDeath(enemy);

    if (this.player.isDead()) this.handlePlayerDeath();

    threeLayer.chaseCamera?.update(this.player.x, this.player.y);
    threeLayer.render();
  }

  private performPlayerAttack(): void {
    const aim = this.player.getAim(this.inputController);
    const originX = this.player.x + aim.x * ATTACK_REACH;
    const originY = this.player.y + aim.y * ATTACK_REACH;
    const stats = getEffectiveStats(this.player.character);

    for (const child of this.enemies.getChildren()) {
      const enemy = child as Enemy;
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(originX, originY, enemy.x, enemy.y);
      if (dist <= ATTACK_HIT_RADIUS) {
        const result = resolveAttack(stats, enemy.def.stats, defaultRng);
        enemy.takeDamage(result.damage);
      }
    }

    const swing = this.add.circle(originX, originY, 16, 0xffffff, 0.5).setDepth(50);
    this.tweens.add({ targets: swing, alpha: 0, scale: 1.4, duration: 130, onComplete: () => swing.destroy() });
  }

  private handleEnemyDeath(enemy: Enemy): void {
    const result = grantXp(this.player.character, enemy.def.xpReward);
    if (result.leveledUp) this.game.events.emit("level-up", result.newLevel);
    recordKill(this.player.character, enemy.def.id);

    const drop = rollDrop(enemy.def, defaultRng);
    if (drop) {
      const pickup = new Pickup(this, enemy.x, enemy.y, drop);
      this.pickups.add(pickup);
    }

    enemy.destroy();
    persistCharacter();
  }

  private handlePickup(pickup: Pickup): void {
    addItem(this.player.character, pickup.item);
    this.game.events.emit("item-pickup", pickup.item);
    persistCharacter();
    pickup.destroy();
  }

  private handleExit(toScene: string, toSpawn: { col: number; row: number }): void {
    if (this.transitioning) return;
    this.transitioning = true;
    this.scene.start(toScene, { spawnCol: toSpawn.col, spawnRow: toSpawn.row });
  }

  private handlePlayerDeath(): void {
    if (this.transitioning) return;
    this.transitioning = true;
    this.player.setVelocity(0, 0);

    const { width, height } = this.scale;
    this.add
      .text(this.cameras.main.scrollX + width / 2, this.cameras.main.scrollY + height / 2, "You have fallen...", {
        fontSize: "26px",
        color: "#ff6666",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3000);

    this.time.delayedCall(1500, () => {
      this.player.character.baseStats.hp = this.player.character.baseStats.maxHp;
      this.scene.start("Town", { spawnCol: TOWN_LEVEL.playerStart.col, spawnRow: TOWN_LEVEL.playerStart.row });
    });
  }
}
