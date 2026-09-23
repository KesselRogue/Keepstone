import * as THREE from "three";
import { toThreeX, toThreeZ } from "./coords";

export interface KeepOptions {
  /** Game-pixel world position of the footprint's center. */
  centerX: number;
  centerY: number;
  /** Footprint width/depth in tiles (the grid cells marked '@' for it). */
  footprintTiles: number;
}

const TIER_COUNT = 5;
const TIER_HEIGHT = 1.4;
// Darkest at the top so the tower reads as tapering stonework rather than a
// flat-shaded stack — cheap substitute for real ambient occlusion.
const TIER_COLORS = [0x6f6f76, 0x68686e, 0x616167, 0x5a5a60, 0x535359];
const ROOF_COLOR = 0x7a2f2f;

/**
 * A procedural 5-tier tapering tower with a pyramidal roof — the town's
 * central landmark. No model pack has a "5-story keep", so this is built
 * from plain Three primitives rather than sourcing new assets, the same way
 * Town's own walls fall back to flat-colored boxes (see LevelBuilder.ts).
 */
export function buildKeepStructure({ centerX, centerY, footprintTiles }: KeepOptions): THREE.Group {
  const group = new THREE.Group();
  const cx = toThreeX(centerX);
  const cz = toThreeZ(centerY);
  const baseSize = footprintTiles - 0.4;
  const topSize = baseSize * 0.42;

  let y = 0;
  for (let i = 0; i < TIER_COUNT; i++) {
    const t = i / (TIER_COUNT - 1);
    const size = THREE.MathUtils.lerp(baseSize, topSize, t);
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size, TIER_HEIGHT, size),
      new THREE.MeshStandardMaterial({ color: TIER_COLORS[i] }),
    );
    mesh.position.set(cx, y + TIER_HEIGHT / 2, cz);
    group.add(mesh);
    y += TIER_HEIGHT;
  }

  const roofHeight = 1.8;
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(topSize * 0.8, roofHeight, 4),
    new THREE.MeshStandardMaterial({ color: ROOF_COLOR }),
  );
  roof.rotation.y = Math.PI / 4; // align the 4 pyramid faces with the box edges below
  roof.position.set(cx, y + roofHeight / 2, cz);
  group.add(roof);

  return group;
}
