import "./style.css";
import Phaser from "phaser";
import { gameConfig } from "./config/gameConfig";
import { persistCharacter } from "./systems/gameState";
import { threeLayer } from "./three/threeLayer";

const game = new Phaser.Game(gameConfig);

window.addEventListener("beforeunload", persistCharacter);

// The Three.js 3D-world layer is a singleton initialized once, before any
// scene runs — Town/DungeonScene each build their own level geometry into
// it and drive its camera/render from their own update() loop.
game.events.once(Phaser.Core.Events.READY, () => {
  const container = document.getElementById("game-container")!;
  threeLayer.init(container, game.canvas);
});
