import { PLAYER_CONFIG } from "../../../constansts/player.constat";
import type { Player } from "../../../types/player.interface";
import type { PlayerStateMachine } from "../player-state-machine";

type FirstJumpParams = {
  player: Player;
  stateMachine: PlayerStateMachine;
  onJumpExecuted: () => void;
};

const {
  coyoteTimeMs: COYOTE_TIME,
  bufferMs: JUMP_BUFFER,
  holdTimeMs: HOLD_TIME,
  holdGravityScale: HOLD_GRAVITY,
  shortHopMultiplier: SHORT_HOP_MULT,
} = PLAYER_CONFIG.jump;

export function PlayerFirstJumpSystem({
  player,
  stateMachine,
  onJumpExecuted,
}: FirstJumpParams) {
  const ctx = stateMachine.getContext();

  const updateGroundedState = (): void => {
    const grounded = player.isGrounded();
    const now = performance.now();

    if (!grounded && ctx.jump.wasGrounded) {
      ctx.jump.leftGroundTimestamp = now;
    }

    if (grounded && !ctx.jump.wasGrounded) {
      const timeSinceLastJump = now - ctx.jump.lastJumpTimestamp;
      if (timeSinceLastJump > JUMP_BUFFER) {
        ctx.jump.lastJumpTimestamp = -Infinity;
        endHold(false);
      }
    }

    ctx.jump.wasGrounded = grounded;
  };

  const isWithinCoyoteTime = (): boolean => {
    if (player.isGrounded()) return true;

    const now = performance.now();
    const timeSinceLeftGround = now - ctx.jump.leftGroundTimestamp;
    return timeSinceLeftGround <= COYOTE_TIME;
  };

  const startHold = (): void => {
    if (ctx.jump.holdActive) return;

    ctx.jump.holdActive = true;
    ctx.jump.holdStartTimestamp = performance.now();
    ctx.jump.savedGravityScale = player.gravityScale;
    player.gravityScale = HOLD_GRAVITY;
  };

  const endHold = (applyShortHop: boolean): void => {
    if (!ctx.jump.holdActive) return;

    ctx.jump.holdActive = false;
    player.gravityScale = ctx.jump.savedGravityScale;

    if (applyShortHop && player.vel.y < 0) {
      const now = performance.now();
      const holdDuration = Math.max(0, now - ctx.jump.holdStartTimestamp);
      const t = Math.min(1, holdDuration / HOLD_TIME);
      const multiplier = SHORT_HOP_MULT + (1 - SHORT_HOP_MULT) * t;
      player.vel.y = player.vel.y * multiplier;
    }
  };

  const canExecuteFirstJump = (): boolean => {
    const now = performance.now();
    const timeSinceLastJump = now - ctx.jump.lastJumpTimestamp;

    if (!isWithinCoyoteTime()) return false;
    if (timeSinceLastJump < JUMP_BUFFER) return false;
    if (!ctx.jump.hasReleasedAfterLastJump) return false;

    return true;
  };

  const executeFirstJump = (): boolean => {
    if (!canExecuteFirstJump()) return false;

    player.jump();
    ctx.jump.lastJumpTimestamp = performance.now();
    ctx.jump.hasReleasedAfterLastJump = false;
    startHold();
    onJumpExecuted();
    return true;
  };

  const handleJumpRelease = (): void => {
    ctx.jump.lastReleaseTimestamp = performance.now();
    ctx.jump.hasReleasedAfterLastJump = true;
    endHold(true);
  };

  const updateEachFrame = (): void => {
    updateGroundedState();

    if (ctx.jump.holdActive) {
      const now = performance.now();
      const holdDuration = now - ctx.jump.holdStartTimestamp;

      if (holdDuration >= HOLD_TIME) {
        endHold(false);
      } else if (player.vel.y >= 0) {
        endHold(false);
      }
    }
  };

  const getLastJumpTimestamp = (): number => ctx.jump.lastJumpTimestamp;
  const getLastReleaseTimestamp = (): number => ctx.jump.lastReleaseTimestamp;

  return {
    executeFirstJump,
    handleJumpRelease,
    updateEachFrame,
    getLastJumpTimestamp,
    getLastReleaseTimestamp,
  };
}
