import "./style.css";
import Phaser from "phaser";
import * as THREE from "three";
import { gameConfig } from "./config/gameConfig";
import { persistCharacter } from "./systems/gameState";
import { ThreeContext } from "./three/ThreeContext";
import { WorldSync } from "./three/WorldSync";
import { ChaseCamera } from "./three/ChaseCamera";
import { playerPosition } from "./three/playerPosition";
import { TOWN_LEVEL } from "./data/levels";

const game = new Phaser.Game(gameConfig);

window.addEventListener("beforeunload", persistCharacter);

// --- Camera spike (migration build-order step 4) ---
// Swaps the still-static spike camera for the real chase camera, following
// the synced tracking box. Phaser's own player sprite still renders
// normally alongside it for comparison.
// TODO: replaced by real WorldSync-driven rendering of the whole level.
game.events.once(Phaser.Core.Events.READY, () => {
  const container = document.getElementById("game-container")!;
  const three = new ThreeContext(container, game.canvas);

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

  const chaseCamera = new ChaseCamera(three.camera, new THREE.Vector3(0, 6, 5.5), 0.12);
  chaseCamera.setBounds({
    minX: 1,
    maxX: TOWN_LEVEL.grid[0].length - 2,
    minZ: 1,
    maxZ: TOWN_LEVEL.grid.length - 2,
  });
  chaseCamera.snapTo(playerPosition.x, playerPosition.y);

  const tick = () => {
    sync.update();
    chaseCamera.update(playerPosition.x, playerPosition.y);
    three.render();
    requestAnimationFrame(tick);
  };
  tick();
});
