import Phaser from "phaser";
import type { ItemInstance } from "../types/Item";
import { RARITY_CONFIG } from "../data/rarity";
import { threeLayer } from "../three/threeLayer";
import { Billboard } from "../three/Billboard";
import { PICKUP_BILLBOARD } from "../three/themes3D";

/**
 * A dropped-item pickup. Physics body stays exactly as before (for the
 * overlap-based collection radius); the floating bob animation is dropped
 * for now (was a Phaser tween on the now-invisible sprite) — deferred to a
 * later polish pass as a genuine Three-side effect instead.
 */
export class Pickup extends Phaser.Physics.Arcade.Sprite {
  item: ItemInstance;
  private billboard: Billboard | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, item: ItemInstance) {
    super(scene, x, y, "tex-pickup");
    this.item = item;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setVisible(false);
    this.setData("item", item);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setCircle(20, -12, -12); // generous pickup radius — no need to walk pixel-perfectly onto loot

    if (threeLayer.context) {
      this.billboard = new Billboard(this, PICKUP_BILLBOARD.textureUrl, PICKUP_BILLBOARD.size, PICKUP_BILLBOARD.size);
      this.billboard.setTint(RARITY_CONFIG[item.rarity].color);
      threeLayer.context.scene.add(this.billboard.sprite);
      this.billboard.update();
    }
  }

  destroy(fromScene?: boolean): void {
    if (this.billboard) threeLayer.context?.scene.remove(this.billboard.sprite);
    super.destroy(fromScene);
  }
}
