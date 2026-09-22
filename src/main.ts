import "./style.css";
import Phaser from "phaser";
import * as THREE from "three";
import { gameConfig } from "./config/gameConfig";
import { persistCharacter } from "./systems/gameState";
import { ThreeContext } from "./three/ThreeContext";
import { WorldSync } from "./three/WorldSync";
import { playerPosition } from "./three/playerPosition";

const game = new Phaser.Game(gameConfig);

window.addEventListener("beforeunload", persistCharacter);

// --- Position-sync spike (migration build-order step 3) ---
// Proves the game-space -> Three-space coordinate mapping by tracking the
// live player position, read-only. Phaser's own player sprite still renders
// normally alongside it for comparison. Camera is still static here — the
// chase camera comes in the next step.
// TODO: replaced by real WorldSync-driven rendering of the whole level.
game.events.once(Phaser.Core.Events.READY, () => {
  const container = document.getElementById("game-container")!;
  const three = new ThreeContext(container, game.canvas);

  // Town's grid occupies roughly Three-space x:[0,18] z:[0,12] (not centered
  // at the origin), so aim the still-static spike camera at the player's
  // actual starting tile rather than (0,0,0). The real chase camera (next
  // step) follows the live position instead of a fixed look-at target.
  three.camera.position.set(9.5, 8, 10.5);
  three.camera.lookAt(new THREE.Vector3(9.5, 0, 2.5));

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: 0x3a5a3a }),
  );
  ground.rotation.x = -Math.PI / 2;
  three.scene.add(ground);

  const marker = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 1.6, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x4a90ff }),
  );
  three.scene.add(marker);
  const sync = new WorldSync(playerPosition, marker, 0.8);

  const tick = () => {
    sync.update();
    three.render();
    requestAnimationFrame(tick);
  };
  tick();
});
