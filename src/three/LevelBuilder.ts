import * as THREE from "three";
import type { LevelDefinition } from "../types/Level";
import { tileToWorld } from "../scenes/levelUtils";
import { toThreeX, toThreeZ } from "./coords";

export interface LevelTheme3D {
  wallColor: number;
  floorColor: number;
  floorColorAlt: number;
}

const WALL_HEIGHT = 1.6;

/**
 * Builds flat-colored placeholder 3D geometry for a level's walls/floor
 * from the same grid data buildLevelGeometry() (the Phaser/physics version)
 * already consumes — proves grid alignment before any real models are
 * wired in (step 11).
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

      if (line[col] === "#") {
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.set(x, WALL_HEIGHT / 2, z);
        group.add(wall);
      } else {
        const floor = new THREE.Mesh(floorGeo, (row + col) % 2 === 0 ? floorMat : floorMatAlt);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(x, 0, z);
        group.add(floor);
      }
    }
  }

  return group;
}
