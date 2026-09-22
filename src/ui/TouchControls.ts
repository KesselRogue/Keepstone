import Phaser from "phaser";
import { touchState } from "../systems/touchState";

const JOYSTICK_RADIUS = 55;
const NUB_RADIUS = 26;

/** On-screen virtual joystick + attack button, shown only on touch-capable devices. */
export class TouchControls {
  private scene: Phaser.Scene;
  private joystickNub!: Phaser.GameObjects.Arc;
  private joystickCenter = { x: 0, y: 0 };
  private joystickPointerId: number | null = null;
  private attackButton!: Phaser.GameObjects.Arc;
  private attackPointerId: number | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    if (!scene.sys.game.device.input.touch) return;

    const { width, height } = scene.scale;
    this.joystickCenter = { x: 110, y: height - 110 };

    scene.add
      .circle(this.joystickCenter.x, this.joystickCenter.y, JOYSTICK_RADIUS, 0xffffff, 0.15)
      .setScrollFactor(0)
      .setDepth(1000)
      .setStrokeStyle(2, 0xffffff, 0.4);
    this.joystickNub = scene.add
      .circle(this.joystickCenter.x, this.joystickCenter.y, NUB_RADIUS, 0xffffff, 0.35)
      .setScrollFactor(0)
      .setDepth(1001);

    this.attackButton = scene.add
      .circle(width - 100, height - 110, 46, 0xdd4444, 0.5)
      .setScrollFactor(0)
      .setDepth(1000)
      .setStrokeStyle(2, 0xffffff, 0.5)
      .setInteractive();
    scene.add
      .text(width - 100, height - 110, "ATK", { fontSize: "16px", color: "#ffffff" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1001);

    scene.input.on("pointerdown", this.onPointerDown, this);
    scene.input.on("pointermove", this.onPointerMove, this);
    scene.input.on("pointerup", this.onPointerUp, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    const distToJoystick = Phaser.Math.Distance.Between(
      pointer.x,
      pointer.y,
      this.joystickCenter.x,
      this.joystickCenter.y,
    );
    if (this.joystickPointerId === null && distToJoystick <= JOYSTICK_RADIUS * 1.8) {
      this.joystickPointerId = pointer.id;
      this.updateJoystick(pointer);
      return;
    }
    if (this.attackPointerId === null && this.attackButton.getBounds().contains(pointer.x, pointer.y)) {
      this.attackPointerId = pointer.id;
      touchState.attackHeld = true;
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    if (pointer.id === this.joystickPointerId) this.updateJoystick(pointer);
  }

  private onPointerUp(pointer: Phaser.Input.Pointer) {
    if (pointer.id === this.joystickPointerId) {
      this.joystickPointerId = null;
      touchState.moveX = 0;
      touchState.moveY = 0;
      this.joystickNub.setPosition(this.joystickCenter.x, this.joystickCenter.y);
    }
    if (pointer.id === this.attackPointerId) {
      this.attackPointerId = null;
      touchState.attackHeld = false;
    }
  }

  private updateJoystick(pointer: Phaser.Input.Pointer) {
    const dx = pointer.x - this.joystickCenter.x;
    const dy = pointer.y - this.joystickCenter.y;
    const dist = Math.min(Math.hypot(dx, dy), JOYSTICK_RADIUS);
    const angle = Math.atan2(dy, dx);
    const nubX = this.joystickCenter.x + Math.cos(angle) * dist;
    const nubY = this.joystickCenter.y + Math.sin(angle) * dist;
    this.joystickNub.setPosition(nubX, nubY);

    const normalized = dist / JOYSTICK_RADIUS;
    touchState.moveX = Math.cos(angle) * normalized;
    touchState.moveY = Math.sin(angle) * normalized;
  }

  private destroy() {
    this.scene.input.off("pointerdown", this.onPointerDown, this);
    this.scene.input.off("pointermove", this.onPointerMove, this);
    this.scene.input.off("pointerup", this.onPointerUp, this);
    touchState.moveX = 0;
    touchState.moveY = 0;
    touchState.attackHeld = false;
  }
}
