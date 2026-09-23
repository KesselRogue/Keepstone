import Phaser from "phaser";
import * as THREE from "three";
import { threeLayer } from "../three/threeLayer";
import { Billboard } from "../three/Billboard";
import { worldToScreen } from "../three/Nameplates";
import { toThreeX, toThreeZ, LOGICAL_WIDTH, LOGICAL_HEIGHT } from "../three/coords";

const WANDER_RADIUS = 90; // game px, around the villager's home point
const WANDER_SPEED = 28; // px/sec — a slow ambient shuffle, not real travel
const RETARGET_MS = [2500, 5500] as const;
const CHATTER_INTERVAL_MS = [6000, 14000] as const;
const CHATTER_DURATION_MS = 2600;
const BUBBLE_HEIGHT = 1.15; // Three units above ground

const CHATTER_LINES = [
  "Fresh bread, still warm!",
  "Careful past the gates after dark.",
  "Keepstone's stood a hundred years — it'll stand a hundred more.",
  "Have you seen the elder today?",
  "The market's busy this morning.",
  "I heard the wilds are worse out east this year.",
  "Lovely weather for the market.",
  "Mind the mud by the well.",
];

/**
 * Purely cosmetic wandering town NPC — no physics body, no interaction,
 * just a billboard that shuffles around a home point and occasionally shows
 * a speech-bubble line, for a "bustling town" feel. Position is a plain
 * object (not a Phaser sprite) since Billboard only needs `.x`/`.y`.
 */
export class Villager {
  private scene: Phaser.Scene;
  private pos: { x: number; y: number };
  private homeX: number;
  private homeY: number;
  private targetX: number;
  private targetY: number;
  private retargetAt = 0;
  private chatterAt: number;
  private chatterUntil = 0;
  private bubble: Phaser.GameObjects.Text | null = null;
  private billboard: Billboard | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, textureUrl: string) {
    this.scene = scene;
    this.pos = { x, y };
    this.homeX = x;
    this.homeY = y;
    this.targetX = x;
    this.targetY = y;
    this.chatterAt = scene.time.now + Phaser.Math.Between(...CHATTER_INTERVAL_MS);

    if (threeLayer.context) {
      this.billboard = new Billboard(this.pos, textureUrl, 0.8, 0.8);
      this.billboard.update();
      threeLayer.context.scene.add(this.billboard.sprite);
    }
  }

  update(delta: number, timeMs: number): void {
    if (timeMs >= this.retargetAt) this.pickNewTarget(timeMs);

    const dx = this.targetX - this.pos.x;
    const dy = this.targetY - this.pos.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 2) {
      const move = Math.min((WANDER_SPEED * delta) / 1000, dist);
      this.pos.x += (dx / dist) * move;
      this.pos.y += (dy / dist) * move;
    }

    this.billboard?.update();
    this.updateChatter(timeMs);
  }

  private pickNewTarget(timeMs: number): void {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * WANDER_RADIUS;
    this.targetX = this.homeX + Math.cos(angle) * radius;
    this.targetY = this.homeY + Math.sin(angle) * radius;
    this.retargetAt = timeMs + Phaser.Math.Between(...RETARGET_MS);
  }

  private updateChatter(timeMs: number): void {
    if (this.bubble && timeMs >= this.chatterUntil) {
      this.bubble.destroy();
      this.bubble = null;
      this.chatterAt = timeMs + Phaser.Math.Between(...CHATTER_INTERVAL_MS);
    }

    if (!this.bubble && timeMs >= this.chatterAt) {
      this.bubble = this.scene.add
        .text(0, 0, Phaser.Utils.Array.GetRandom(CHATTER_LINES), {
          fontSize: "11px",
          color: "#1a1a22",
          backgroundColor: "#f0e6c8",
          padding: { x: 6, y: 3 },
        })
        .setOrigin(0.5, 1)
        .setDepth(35);
      this.chatterUntil = timeMs + CHATTER_DURATION_MS;
    }

    if (!this.bubble) return;
    const camera = threeLayer.context?.camera;
    if (!camera) {
      this.bubble.setVisible(false);
      return;
    }
    const worldPos = new THREE.Vector3(toThreeX(this.pos.x), BUBBLE_HEIGHT, toThreeZ(this.pos.y));
    const screen = worldToScreen(worldPos, camera, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    this.bubble.setVisible(screen.visible);
    if (screen.visible) this.bubble.setPosition(screen.x, screen.y);
  }

  destroy(): void {
    if (this.billboard) threeLayer.context?.scene.remove(this.billboard.sprite);
    this.bubble?.destroy();
  }
}
