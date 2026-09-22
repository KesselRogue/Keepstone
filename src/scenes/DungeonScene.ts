import Phaser from "phaser";
import { DUNGEON_LEVEL, TOWN_LEVEL } from "../data/levels";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Pickup } from "../entities/Pickup";
import { Skulker } from "../entities/enemies/Skulker";
import { Brute } from "../entities/enemies/Brute";
import { InputController } from "../systems/InputController";
import { playerCharacter, persistCharacter } from "../systems/gameState";
import { getEffectiveStats, addItem } from "../systems/InventorySystem";
import { resolveAttack } from "../systems/CombatSystem";
import { grantXp } from "../systems/LevelingSystem";
import { rollDrop } from "../systems/LootSystem";
import { defaultRng } from "../utils/rng";
import {
  buildLevelGeometry,
  createExitZones,
  tileToWorld,
  wireCharacterSheetOpener,
  wireQuestLogOpener,
  type ExitZone,
} from "./levelUtils";
import { recordKill } from "../systems/QuestSystem";
import { threeLayer } from "../three/threeLayer";
import { buildLevel3D } from "../three/LevelBuilder";
import { DUNGEON_THEME_3D } from "../three/themes3D";

interface SceneEntryData {
  spawnCol?: number;
  spawnRow?: number;
}

const ATTACK_REACH = 42;
const ATTACK_HIT_RADIUS = 34;
const ATTACK_TRIGGER_SLACK = 1.3;

export class DungeonScene extends Phaser.Scene {
  private player!: Player;
  private inputController!: InputController;
  private enemies!: Phaser.Physics.Arcade.Group;
  private pickups!: Phaser.Physics.Arcade.Group;
  private exitZones: ExitZone[] = [];
  private transitioning = false;

  constructor() {
    super("Dungeon");
  }

  create(data: SceneEntryData): void {
    this.transitioning = false;
    const level = DUNGEON_LEVEL;
    const built = buildLevelGeometry(this, level);
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

    threeLayer.setLevelGroup(buildLevel3D(level, DUNGEON_THEME_3D));
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
      const enemy = spawn.enemyDefId === "brute" ? new Brute(this, pos.x, pos.y) : new Skulker(this, pos.x, pos.y);
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
    const isBrute = enemy.def.id === "brute";

    const result = grantXp(this.player.character, enemy.def.xpReward);
    if (result.leveledUp) this.game.events.emit("level-up", result.newLevel);
    recordKill(this.player.character, enemy.def.id);

    // Boss kills are guaranteed epic — grunts still roll the normal rarity table.
    const drop = rollDrop(enemy.def, defaultRng, isBrute ? "epic" : undefined);
    if (drop) {
      const pickup = new Pickup(this, enemy.x, enemy.y, drop);
      this.pickups.add(pickup);
    }

    enemy.destroy();
    persistCharacter();

    if (isBrute) this.showVictoryBanner();
  }

  /** Non-blocking: play continues so the player can walk over and collect the
   * boss's drop, then leave via the normal exit whenever they're ready. */
  private showVictoryBanner(): void {
    const { width, height } = this.scale;
    const text = this.add
      .text(
        this.cameras.main.scrollX + width / 2,
        this.cameras.main.scrollY + height / 2 - 140,
        "Keep Cleared!\nThe Brute falls — collect its spoils.",
        { fontSize: "22px", color: "#ffe66d", align: "center", fontStyle: "bold" },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3000)
      .setAlpha(0);

    this.tweens.add({
      targets: text,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: 2200,
      onComplete: () => text.destroy(),
    });
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
