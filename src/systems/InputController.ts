import Phaser from "phaser";
import { touchState } from "./touchState";

export interface Vector2 {
  x: number;
  y: number;
}

/** Unifies keyboard/mouse (desktop) and virtual joystick/button (touch) behind one API. */
export class InputController {
  private scene: Phaser.Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys: { w: Phaser.Input.Keyboard.Key; a: Phaser.Input.Keyboard.Key; s: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const keyboard = scene.input.keyboard!;
    this.cursors = keyboard.createCursorKeys();
    this.keys = {
      w: keyboard.addKey("W"),
      a: keyboard.addKey("A"),
      s: keyboard.addKey("S"),
      d: keyboard.addKey("D"),
    };
  }

  getMovementVector(): Vector2 {
    if (touchState.moveX !== 0 || touchState.moveY !== 0) {
      return { x: touchState.moveX, y: touchState.moveY };
    }

    let x = 0;
    let y = 0;
    if (this.cursors.left.isDown || this.keys.a.isDown) x -= 1;
    if (this.cursors.right.isDown || this.keys.d.isDown) x += 1;
    if (this.cursors.up.isDown || this.keys.w.isDown) y -= 1;
    if (this.cursors.down.isDown || this.keys.s.isDown) y += 1;

    if (x !== 0 && y !== 0) {
      const inv = 1 / Math.sqrt(2);
      x *= inv;
      y *= inv;
    }
    return { x, y };
  }

  isAttackHeld(): boolean {
    return this.scene.input.activePointer.isDown || touchState.attackHeld;
  }

  /** Direction to aim an attack: mouse pointer on desktop, else last movement direction. */
  getAimVector(originX: number, originY: number, fallback: Vector2): Vector2 {
    const pointer = this.scene.input.activePointer;
    if (pointer.isDown && !touchState.attackHeld) {
      const cam = this.scene.cameras.main;
      const worldPoint = cam.getWorldPoint(pointer.x, pointer.y);
      const dx = worldPoint.x - originX;
      const dy = worldPoint.y - originY;
      const len = Math.hypot(dx, dy);
      if (len > 0) return { x: dx / len, y: dy / len };
    }
    if (fallback.x !== 0 || fallback.y !== 0) return fallback;
    return { x: 0, y: 1 };
  }
}
