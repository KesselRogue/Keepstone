import "./style.css";
import Phaser from "phaser";
import * as THREE from "three";
import { gameConfig } from "./config/gameConfig";
import { persistCharacter } from "./systems/gameState";
import { ThreeContext } from "./three/ThreeContext";
import { WorldSync } from "./three/WorldSync";
import { ChaseCamera } from "./three/ChaseCamera";
import { buildLevel3D } from "./three/LevelBuilder";
import { playerPosition } from "./three/playerPosition";
import { TOWN_LEVEL } from "./data/levels";

const game = new Phaser.Game(gameConfig);

window.addEventListener("beforeunload", persistCharacter);

// --- Level geometry spike (migration build-order step 5) ---
// Builds the actual town's walls/floor in 3D from the same grid data the
// Phaser side uses, to prove grid alignment. Phaser's own 2D walls/floor
// still render on top for visual comparison (nothing hidden yet — that's
// the next step).
// TODO: replaced by real WorldSync-driven rendering of the whole level.
game.events.once(Phaser.Core.Events.READY, () => {
  const container = document.getElementById("game-container")!;
  const three = new ThreeContext(container, game.canvas);

  const levelGroup = buildLevel3D(TOWN_LEVEL, {
    wallColor: 0x2f6b3a,
    floorColor: 0x3a5a3a,
    floorColorAlt: 0x355536,
  });
  three.scene.add(levelGroup);

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
