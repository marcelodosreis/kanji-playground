// jump-logic-system.ts
import type { Player } from "../../../../types/player.interface";
import { GLOBAL_STATE } from "../../../../types/global-state.enum";
import { GLOBAL_STATE_CONTROLLER } from "../../../global-state-controller";

type JumpLogicParams = {
  player: Player;
  onJumpExecuted: () => void;
};

const MAX_JUMPS = 2;
const COYOTE_TIME_MS = 50;

export function PlayerJumpLogicSystem({
  player,
  onJumpExecuted,
}: JumpLogicParams) {
  let jumpsPerformed = 0;
  let wasGrounded = player.isGrounded();
  let leftGroundTimestamp = wasGrounded ? -Infinity : Date.now();

  const syncDoubleJumpUnlock = (): void => {
    const isUnlocked =
      GLOBAL_STATE_CONTROLLER.current()[GLOBAL_STATE.IS_DOUBLE_JUMB_UNLOCKED];
    if (isUnlocked && player.numJumps !== MAX_JUMPS) {
      player.numJumps = MAX_JUMPS;
    }
  };

  const updateGroundedTimestamps = (): void => {
    const isGrounded = player.isGrounded();

    if (!isGrounded && wasGrounded) {
      leftGroundTimestamp = Date.now();
    }

    if (isGrounded && !wasGrounded) {
      jumpsPerformed = 0;
    }

    wasGrounded = isGrounded;
  };

  const isWithinCoyoteTime = (): boolean => {
    if (player.isGrounded()) {
      return true;
    }
    const now = Date.now();
    return now - leftGroundTimestamp <= COYOTE_TIME_MS;
  };

  const executeJump = (): boolean => {
    if (isWithinCoyoteTime()) {
      player.doubleJump();
      jumpsPerformed = Math.max(jumpsPerformed, 1);
      return true;
    }

    const canDoubleJump = jumpsPerformed === 1 && player.numJumps > 0;
    if (canDoubleJump) {
      player.doubleJump();
      jumpsPerformed = 2;
      return true;
    }

    return false;
  };

  const handleJumpRequest = (): void => {
    syncDoubleJumpUnlock();
    const jumped = executeJump();
    if (jumped) {
      onJumpExecuted();
    }
  };

  const resetJumpsOnLanding = (): void => {
    updateGroundedTimestamps();
  };

  return {
    handleJumpRequest,
    resetJumpsOnLanding,
  };
}
