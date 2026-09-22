import "./style.css";
import Phaser from "phaser";
import { gameConfig } from "./config/gameConfig";
import { persistCharacter } from "./systems/gameState";

new Phaser.Game(gameConfig);

window.addEventListener("beforeunload", persistCharacter);
