import "./style.css";
import Phaser from "phaser";
import * as THREE from "three";
import { gameConfig } from "./config/gameConfig";
import { persistCharacter } from "./systems/gameState";
import { ThreeContext } from "./three/ThreeContext";

const game = new Phaser.Game(gameConfig);

window.addEventListener("beforeunload", persistCharacter);

// --- Dual-canvas spike (migration build-order step 2) ---
// Proves the Three.js layer renders correctly behind Phaser's canvas and
// stays aligned across resizes, before any real scene/entity code changes.
// TODO: replaced by real WorldSync-driven rendering in later steps.
game.events.once(Phaser.Core.Events.READY, () => {
  const container = document.getElementById("game-container")!;
  const three = new ThreeContext(container, game.canvas);

  three.camera.position.set(0, 6, 8);
  three.camera.lookAt(0, 0, 0);

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial({ color: 0x4a90ff }),
  );
  three.scene.add(cube);

  const tick = () => {
    cube.rotation.x += 0.008;
    cube.rotation.y += 0.013;
    three.render();
    requestAnimationFrame(tick);
  };
  tick();
});
