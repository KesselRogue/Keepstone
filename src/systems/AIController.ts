import type { AiProfile } from "../types/Enemy";
import { distance } from "../utils/mathUtils";

export type AiState = "idle" | "chase" | "windup" | "attack" | "cooldown";

export interface AiDecision {
  state: AiState;
  moveX: number;
  moveY: number;
  triggerAttack: boolean;
}

/** Simple per-enemy state machine: idle -> chase -> (windup ->) attack -> cooldown. */
export class AIController {
  private profile: AiProfile;
  private state: AiState = "idle";
  private timer = 0;

  constructor(profile: AiProfile) {
    this.profile = profile;
  }

  update(deltaMs: number, ex: number, ey: number, px: number, py: number): AiDecision {
    const dist = distance(ex, ey, px, py);
    this.timer = Math.max(0, this.timer - deltaMs);

    if (this.state === "windup") {
      if (this.timer === 0) {
        this.state = "attack";
        this.timer = 1;
      }
      return { state: this.state, moveX: 0, moveY: 0, triggerAttack: false };
    }

    if (this.state === "attack") {
      this.state = "cooldown";
      this.timer = this.profile.attackCooldownMs;
      return { state: this.state, moveX: 0, moveY: 0, triggerAttack: true };
    }

    if (this.state === "cooldown") {
      if (this.timer === 0) this.state = dist <= this.profile.detectRadius ? "chase" : "idle";
      return { state: this.state, moveX: 0, moveY: 0, triggerAttack: false };
    }

    if (dist <= this.profile.attackRadius) {
      if (this.profile.windupMs) {
        this.state = "windup";
        this.timer = this.profile.windupMs;
      } else {
        this.state = "attack";
        this.timer = 1;
      }
      return { state: this.state, moveX: 0, moveY: 0, triggerAttack: false };
    }

    if (dist <= this.profile.detectRadius) {
      this.state = "chase";
      const dx = px - ex;
      const dy = py - ey;
      const len = Math.hypot(dx, dy) || 1;
      return { state: this.state, moveX: dx / len, moveY: dy / len, triggerAttack: false };
    }

    this.state = "idle";
    return { state: this.state, moveX: 0, moveY: 0, triggerAttack: false };
  }

  get currentState(): AiState {
    return this.state;
  }
}
