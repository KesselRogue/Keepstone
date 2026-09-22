import Phaser from "phaser";
import { BootScene } from "../scenes/BootScene";
import { PreloaderScene } from "../scenes/PreloaderScene";
import { TownScene } from "../scenes/TownScene";
import { DungeonScene } from "../scenes/DungeonScene";
import { UIScene } from "../scenes/UIScene";
import { CharacterScene } from "../scenes/CharacterScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#141414",
  width: 800,
  height: 600,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 3,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, PreloaderScene, TownScene, DungeonScene, UIScene, CharacterScene],
};
