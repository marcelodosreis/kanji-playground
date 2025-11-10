import type { Player } from "../../../../types/player.interface";
import { GLOBAL_STATE } from "../../../../types/global-state.enum";
import { GLOBAL_STATE_CONTROLLER } from "../../../global-state-controller";

type JumpLogicParams = {
  player: Player;
  onJumpExecuted: () => void;
};

const MAX_JUMPS = 2;
const COYOTE_TIME_MS = 160;
const HOLD_TIME_MS = 280;
const HOLD_GRAVITY_SCALE = 0.38;
const SHORT_HOP_MULTIPLIER = 0.25;
const JUMP_BUFFER_MS = 50;
const DOUBLE_JUMP_FORCE = 320;

export function PlayerJumpLogicSystem({
  player,
  onJumpExecuted,
}: JumpLogicParams) {
  let jumpsPerformed = 0;
  let wasGrounded = player.isGrounded();
  let leftGroundTimestamp = wasGrounded ? -Infinity : Date.now();
  let lastJumpTimestamp = -Infinity;
  let lastReleaseTimestamp = -Infinity;

  let holdActive = false;
  let holdStartTimestamp = 0;
  let savedGravityScale = player.gravityScale;

  const syncDoubleJumpUnlock = (): void => {
    const isUnlocked =
      GLOBAL_STATE_CONTROLLER.current()[GLOBAL_STATE.IS_DOUBLE_JUMP_UNLOCKED];
    if (isUnlocked && player.numJumps !== MAX_JUMPS) {
      player.numJumps = MAX_JUMPS;
    }
  };

  const updateGroundedState = (): void => {
    const grounded = player.isGrounded();
    const now = Date.now();

    if (!grounded && wasGrounded) {
      leftGroundTimestamp = now;
    }

    if (grounded && !wasGrounded) {
      const timeSinceLastJump = now - lastJumpTimestamp;
      if (timeSinceLastJump > JUMP_BUFFER_MS) {
        jumpsPerformed = 0;
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

  const executeJumpNow = (): boolean => {
    const now = Date.now();
    const timeSinceLastJump = now - lastJumpTimestamp;

    const isFirstJump = isWithinCoyoteTime() && jumpsPerformed === 0;
    const isDoubleJump = jumpsPerformed === 1 && player.numJumps >= 2;

    if (isFirstJump && timeSinceLastJump < JUMP_BUFFER_MS) {
      return false;
    }

    if (isFirstJump) {
      player.jump();
      jumpsPerformed = 1;
      lastJumpTimestamp = now;
      startHold();
      return true;
    }

    if (isDoubleJump) {
      const hadReleaseAfterJump = lastReleaseTimestamp > lastJumpTimestamp;

      if (!hadReleaseAfterJump) {
        return false;
      }

      if (holdActive) {
        endHold(false);
      }

      const velBefore = player.vel.y;
      player.doubleJump(DOUBLE_JUMP_FORCE);
      jumpsPerformed = 2;
      lastJumpTimestamp = now;

      if (Math.abs(player.vel.y - velBefore) < 1) {
      }
      return true;
    }

    return false;
  };

  const handleJumpPress = (): void => {
    syncDoubleJumpUnlock();
    const didJump = executeJumpNow();
    if (didJump) {
      onJumpExecuted();
    }
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

  return {
    handleJumpPress,
    handleJumpRelease,
    resetEachFrame,
  };
}
