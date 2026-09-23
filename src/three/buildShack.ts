import * as THREE from "three";
import { Billboard } from "./Billboard";

const ROOF_TEXTURES = ["assets/sprites/roof-gray.png", "assets/sprites/roof-red.png"];
const DOOR_TEXTURES = ["assets/sprites/door-tan-double.png", "assets/sprites/door-gray.png"];

/**
 * A small decorative home: a door billboard on the ground with a roof
 * billboard lifted above it. Purely cosmetic (no collision) — scattering a
 * few of these around the keep is what makes Town read as lived-in rather
 * than just an open field with a tower in it. Built from Billboards (camera-
 * facing sprites) rather than the grid/wall system since it's a one-off
 * prop, not level geometry.
 */
export function buildShack(pos: { x: number; y: number }, variant: number): THREE.Object3D[] {
  const door = new Billboard(pos, DOOR_TEXTURES[variant % DOOR_TEXTURES.length], 0.9, 0.9);
  door.update();

  const roof = new Billboard(pos, ROOF_TEXTURES[variant % ROOF_TEXTURES.length], 1.4, 0.85);
  roof.update();
  // Lift above the door so it reads as a roofline, not a second door. Kept
  // modest (rather than a taller, more dramatic peak) because a billboard
  // offset this far above ground level can clip out of frame near the top
  // edge of the camera's view when the shack itself is near screen edge.
  roof.sprite.position.y = 0.95;
  roof.sprite.renderOrder = 1;

  return [door.sprite, roof.sprite];
}
