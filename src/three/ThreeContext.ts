import * as THREE from "three";

/**
 * Owns the Three.js scene/camera/renderer and keeps its canvas exactly
 * aligned with Phaser's own canvas (which sits on top and draws all 2D UI).
 * Phaser's Scale.FIT mode computes the visible canvas rect dynamically, so
 * alignment is done by observing Phaser's actual rendered canvas via
 * ResizeObserver rather than assuming a fixed size.
 */
export class ThreeContext {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly canvas: HTMLCanvasElement;

  private phaserCanvas: HTMLCanvasElement;
  private resizeObserver: ResizeObserver;

  constructor(container: HTMLElement, phaserCanvas: HTMLCanvasElement) {
    this.phaserCanvas = phaserCanvas;

    this.canvas = document.createElement("canvas");
    this.canvas.id = "three-canvas";
    container.insertBefore(this.canvas, container.firstChild);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, 4 / 3, 0.1, 1000);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    const sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(6, 12, 6);
    this.scene.add(ambient, sun);

    this.resizeObserver = new ResizeObserver(() => this.syncToPhaserCanvas());
    this.resizeObserver.observe(this.phaserCanvas);
    this.syncToPhaserCanvas();
  }

  private syncToPhaserCanvas(): void {
    const rect = this.phaserCanvas.getBoundingClientRect();
    const parentRect = this.phaserCanvas.offsetParent
      ? (this.phaserCanvas.offsetParent as HTMLElement).getBoundingClientRect()
      : { left: 0, top: 0 };
    const left = rect.left - parentRect.left;
    const top = rect.top - parentRect.top;
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));

    this.canvas.style.left = `${left}px`;
    this.canvas.style.top = `${top}px`;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  destroy(): void {
    this.resizeObserver.disconnect();
    this.renderer.dispose();
    this.canvas.remove();
  }
}
