/**
 * Shared mutable state bridging the on-screen touch controls (rendered in
 * UIScene) with InputController (read from the gameplay scene). A plain
 * module singleton is simplest for a single-instance game — no need for
 * Phaser's registry/event-bus ceremony for one producer and one consumer.
 */
export const touchState = {
  moveX: 0,
  moveY: 0,
  attackHeld: false,
};
