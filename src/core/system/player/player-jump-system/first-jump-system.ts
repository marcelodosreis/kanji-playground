import type { Player } from "../../../../types/player.interface";

type FirstJumpParams = {
  player: Player;
  onJumpExecuted: () => void;
};

const COYOTE_TIME_MS = 80;
const HOLD_TIME_MS = 360;
const HOLD_GRAVITY_SCALE = 0.39;
const SHORT_HOP_MULTIPLIER = 0.26;
const JUMP_BUFFER_MS = 50;

export function PlayerFirstJumpSystem({
  player,
  onJumpExecuted,
}: FirstJumpParams) {
  let wasGrounded = player.isGrounded();
  let leftGroundTimestamp = wasGrounded ? -Infinity : Date.now();
  let lastJumpTimestamp = -Infinity;
  let lastReleaseTimestamp = -Infinity;

  let holdActive = false;
  let holdStartTimestamp = 0;
  let savedGravityScale = player.gravityScale;

  const updateGroundedState = (): void => {
    const grounded = player.isGrounded();
    const now = Date.now();

    if (!grounded && wasGrounded) {
      leftGroundTimestamp = now;
    }

    if (grounded && !wasGrounded) {
      const timeSinceLastJump = now - lastJumpTimestamp;
      if (timeSinceLastJump > JUMP_BUFFER_MS) {
        lastJumpTimestamp = -Infinity;
        endHold(false);
      }
    }

    wasGrounded = grounded;
  };

  const isWithinCoyoteTime = (): boolean => {
    if (player.isGrounded()) {
      return true;
    }
    const now = Date.now();
    return now - leftGroundTimestamp <= COYOTE_TIME_MS;
  };

  const startHold = (): void => {
    if (holdActive) {
      return;
    }
    holdActive = true;
    holdStartTimestamp = Date.now();
    savedGravityScale = player.gravityScale;
    player.gravityScale = HOLD_GRAVITY_SCALE;
  };

  const endHold = (applyShortHop: boolean): void => {
    if (!holdActive) {
      return;
    }
    holdActive = false;
    player.gravityScale = savedGravityScale;

    if (applyShortHop && player.vel.y < 0) {
      const now = Date.now();
      const holdDuration = Math.max(0, now - holdStartTimestamp);
      const t = Math.min(1, holdDuration / HOLD_TIME_MS);
      const multiplier = SHORT_HOP_MULTIPLIER + (1 - SHORT_HOP_MULTIPLIER) * t;
      player.vel.y = player.vel.y * multiplier;
    }
  };

  const canExecuteFirstJump = (): boolean => {
    const now = Date.now();
    const timeSinceLastJump = now - lastJumpTimestamp;

    if (!isWithinCoyoteTime()) {
      return false;
    }

    if (timeSinceLastJump < JUMP_BUFFER_MS) {
      return false;
    }

    return true;
  };

  const executeFirstJump = (): boolean => {
    if (!canExecuteFirstJump()) {
      return false;
    }

    player.jump();
    lastJumpTimestamp = Date.now();
    startHold();
    onJumpExecuted();
    return true;
  };

  const handleJumpRelease = (): void => {
    lastReleaseTimestamp = Date.now();
    endHold(true);
  };

  const resetEachFrame = (): void => {
    updateGroundedState();

    if (holdActive) {
      const now = Date.now();
      if (now - holdStartTimestamp >= HOLD_TIME_MS) {
        endHold(false);
      } else if (player.vel.y >= 0) {
        endHold(false);
      }
    }
  };

  const getLastJumpTimestamp = (): number => lastJumpTimestamp;
  const getLastReleaseTimestamp = (): number => lastReleaseTimestamp;

  return {
    executeFirstJump,
    handleJumpRelease,
    resetEachFrame,
    getLastJumpTimestamp,
    getLastReleaseTimestamp,
  };
}
