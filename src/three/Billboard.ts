import * as THREE from "three";
import { toThreeX, toThreeZ } from "./coords";
import { loadTexture } from "./textures";

/**
 * A camera-facing (THREE.Sprite is always camera-facing by construction)
 * 2D image floating in the 3D world, synced to a game-space {x,y} each
 * frame. Reuses the existing Kenney PNGs — the standard "flat sprite over
 * a 3D scene" technique classic ARPGs used for characters.
 */
export class Billboard {
  readonly sprite: THREE.Sprite;
  private source: { x: number; y: number };
  private groundOffset: number;

  constructor(
    source: { x: number; y: number },
    textureUrl: string | null,
    widthUnits: number,
    heightUnits: number,
  ) {
    this.source = source;
    this.groundOffset = heightUnits / 2;
    const material = new THREE.SpriteMaterial({
      map: textureUrl ? loadTexture(textureUrl) : null,
      transparent: true,
    });
    this.sprite = new THREE.Sprite(material);
    this.sprite.scale.set(widthUnits, heightUnits, 1);
  }

  /** World-space Y of the billboard's top edge — used for HP bar placement. */
  get topY(): number {
    return this.groundOffset * 2;
  }

  setTint(color: number | null): void {
    const material = this.sprite.material as THREE.SpriteMaterial;
    material.color.set(color ?? 0xffffff);
  }

  update(): void {
    this.sprite.position.set(toThreeX(this.source.x), this.groundOffset, toThreeZ(this.source.y));
  }
}
