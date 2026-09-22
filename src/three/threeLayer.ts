import * as THREE from "three";
import { ThreeContext } from "./ThreeContext";
import { ChaseCamera } from "./ChaseCamera";

/**
 * App-wide singleton owning the Three.js layer: the render context, the
 * chase camera, and whichever level's geometry group is currently active
 * (swapped out on scene transitions). Entities (Player/Enemy/Pickup) read
 * `threeLayer.context` directly to add/remove their own billboards — same
 * "shared mutable singleton" pattern as systems/gameState.ts.
 */
class ThreeLayer {
  context: ThreeContext | null = null;
  chaseCamera: ChaseCamera | null = null;
  private currentLevelGroup: THREE.Group | null = null;

  init(container: HTMLElement, phaserCanvas: HTMLCanvasElement): void {
    if (this.context) return;
    this.context = new ThreeContext(container, phaserCanvas);
    this.chaseCamera = new ChaseCamera(this.context.camera, new THREE.Vector3(0, 9, 8.2), 0.12);

    // Scroll wheel zoom: listen on the container (not either canvas
    // specifically) so it works regardless of which one is on top.
    // preventDefault stops the page itself from scrolling.
    container.addEventListener(
      "wheel",
      (e: WheelEvent) => {
        e.preventDefault();
        this.chaseCamera?.adjustZoom(e.deltaY * 0.0015);
      },
      { passive: false },
    );
  }

  setLevelGroup(group: THREE.Group): void {
    if (!this.context) return;
    if (this.currentLevelGroup) this.context.scene.remove(this.currentLevelGroup);
    this.currentLevelGroup = group;
    this.context.scene.add(group);
  }

  render(): void {
    this.context?.render();
  }
}

export const threeLayer = new ThreeLayer();
