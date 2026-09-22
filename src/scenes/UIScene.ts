import Phaser from "phaser";
import { playerCharacter } from "../systems/gameState";
import { getEffectiveStats } from "../systems/InventorySystem";
import { HealthBar } from "../ui/HealthBar";
import { InventoryPanel } from "../ui/InventoryPanel";
import { LevelUpToast } from "../ui/LevelUpToast";
import { TouchControls } from "../ui/TouchControls";

export class UIScene extends Phaser.Scene {
  private healthBar!: HealthBar;
  private xpBar!: HealthBar;
  private inventoryPanel!: InventoryPanel;
  private levelUpToast!: LevelUpToast;

  constructor() {
    super("UI");
  }

  create(): void {
    this.healthBar = new HealthBar(this, 16, 16, 220, 22, 0xd23c3c, "");
    this.xpBar = new HealthBar(this, 16, 42, 220, 10, 0x4a90ff, "");
    this.inventoryPanel = new InventoryPanel(this, () => playerCharacter);
    this.levelUpToast = new LevelUpToast(this);
    new TouchControls(this);

    this.inventoryPanel.refreshSlots();

    this.game.events.on("level-up", (level: number) => this.levelUpToast.show(level));
    this.game.events.on("item-pickup", () => this.inventoryPanel.refreshSlots());

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off("level-up");
      this.game.events.off("item-pickup");
    });
  }

  update(): void {
    const effective = getEffectiveStats(playerCharacter);
    this.healthBar.setValue(effective.hp, effective.maxHp, `HP ${Math.ceil(effective.hp)} / ${Math.ceil(effective.maxHp)}`);
    this.xpBar.setValue(playerCharacter.xp, playerCharacter.xpToNextLevel, `Lv ${playerCharacter.level}`);
  }
}
