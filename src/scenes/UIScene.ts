import Phaser from "phaser";
import { playerCharacter } from "../systems/gameState";
import { getEffectiveStats } from "../systems/InventorySystem";
import { HealthBar } from "../ui/HealthBar";
import { LevelUpToast } from "../ui/LevelUpToast";
import { TouchControls } from "../ui/TouchControls";

export class UIScene extends Phaser.Scene {
  private healthBar!: HealthBar;
  private xpBar!: HealthBar;
  private levelUpToast!: LevelUpToast;
  private charHint!: Phaser.GameObjects.Text;

  constructor() {
    super("UI");
  }

  create(): void {
    this.healthBar = new HealthBar(this, 16, 16, 220, 22, 0xd23c3c, "");
    this.xpBar = new HealthBar(this, 16, 42, 220, 10, 0x4a90ff, "");
    this.levelUpToast = new LevelUpToast(this);
    new TouchControls(this);

    const { width } = this.scale;
    this.charHint = this.add
      .text(width - 16, 20, "", { fontSize: "13px", color: "#ffffff", backgroundColor: "#333333", padding: { x: 8, y: 6 } })
      .setOrigin(1, 0.5)
      .setScrollFactor(0)
      .setDepth(1000);

    this.game.events.on("level-up", (level: number) => this.levelUpToast.show(level));

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off("level-up");
    });
  }

  update(): void {
    const effective = getEffectiveStats(playerCharacter);
    this.healthBar.setValue(effective.hp, effective.maxHp, `HP ${Math.ceil(effective.hp)} / ${Math.ceil(effective.maxHp)}`);
    this.xpBar.setValue(playerCharacter.xp, playerCharacter.xpToNextLevel, `Lv ${playerCharacter.level}`);
    this.charHint.setText(`[C] Character (${playerCharacter.inventory.length})   ${playerCharacter.gold}g`);
  }
}
