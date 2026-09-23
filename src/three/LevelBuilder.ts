import * as THREE from "three";
import type { LevelDefinition } from "../types/Level";
import { tileToWorld } from "../scenes/levelUtils";
import { toThreeX, toThreeZ } from "./coords";
import { getModelClone } from "./AssetLoader";

export interface LevelTheme3D {
  wallColor: number;
  floorColor: number;
  floorColorAlt: number;
  /** Real GLTF models (must be preloaded via AssetLoader first) — falls
   * back to the flat-colored primitive below if unset or not yet loaded. */
  wallModelUrl?: string;
  floorModelUrl?: string;
}

const WALL_HEIGHT = 1.6;

/**
 * Builds a level's wall/floor 3D geometry from the same grid data
 * buildLevelGeometry() (the Phaser/physics version) already consumes —
 * real GLTF models where the theme provides them (and they've finished
 * preloading), flat-colored primitives as a fallback otherwise.
 */
export function buildLevel3D(level: LevelDefinition, theme: LevelTheme3D): THREE.Group {
  const group = new THREE.Group();
  const wallGeo = new THREE.BoxGeometry(1, WALL_HEIGHT, 1);
  const floorGeo = new THREE.PlaneGeometry(1, 1);
  const wallMat = new THREE.MeshStandardMaterial({ color: theme.wallColor });
  const floorMat = new THREE.MeshStandardMaterial({ color: theme.floorColor });
  const floorMatAlt = new THREE.MeshStandardMaterial({ color: theme.floorColorAlt });

  for (let row = 0; row < level.grid.length; row++) {
    const line = level.grid[row];
    for (let col = 0; col < line.length; col++) {
      const worldPos = tileToWorld(level, col, row);
      const x = toThreeX(worldPos.x);
      const z = toThreeZ(worldPos.y);

      if (line[col] === "@") {
        // Landmark footprint (e.g. the town's keep) — collides like a wall
        // (see levelUtils.buildLevelGeometry) but its 3D visual is a custom
        // structure added by the scene itself, not a generic wall box.
        continue;
      }

      if (line[col] === "#") {
        const model = theme.wallModelUrl ? getModelClone(theme.wallModelUrl) : null;
        if (model) {
          model.object.scale.setScalar(model.scale);
          model.object.position.set(x, model.baseYOffset, z);
          group.add(model.object);
        } else {
          const wall = new THREE.Mesh(wallGeo, wallMat);
          wall.position.set(x, WALL_HEIGHT / 2, z);
          group.add(wall);
        }
      } else {
        const model = theme.floorModelUrl ? getModelClone(theme.floorModelUrl) : null;
        if (model) {
          model.object.scale.setScalar(model.scale);
          model.object.position.set(x, model.baseYOffset, z);
          group.add(model.object);
        } else {
          const floor = new THREE.Mesh(floorGeo, (row + col) % 2 === 0 ? floorMat : floorMatAlt);
          floor.rotation.x = -Math.PI / 2;
          floor.position.set(x, 0, z);
          group.add(floor);
        }
      }
    }
  }

  return group;
}
