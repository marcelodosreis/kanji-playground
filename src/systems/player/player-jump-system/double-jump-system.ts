import type { Player } from "../../../types/player.interface";
import { GLOBAL_STATE } from "../../../types/global-state.enum";
import { GLOBAL_STATE_CONTROLLER } from "../../../core/global-state-controller";

type DoubleJumpParams = {
  player: Player;
  onJumpExecuted: () => void;
  getLastJumpTimestamp: () => number;
  getLastReleaseTimestamp: () => number;
};

const MAX_JUMPS = 2;
const DOUBLE_JUMP_FORCE = 320;

export function PlayerDoubleJumpSystem({
  player,
  onJumpExecuted,
  getLastJumpTimestamp,
  getLastReleaseTimestamp,
}: DoubleJumpParams) {
  let jumpsPerformed = 0;

  const syncDoubleJumpUnlock = (): void => {
    const isUnlocked =
      GLOBAL_STATE_CONTROLLER.current()[GLOBAL_STATE.IS_DOUBLE_JUMP_UNLOCKED];
    if (isUnlocked && player.numJumps !== MAX_JUMPS) {
      player.numJumps = MAX_JUMPS;
    }
  };

  const canExecuteDoubleJump = (): boolean => {
    if (jumpsPerformed !== 1) {
      return false;
    }

    if (player.numJumps < 2) {
      return false;
    }

    if (player.isGrounded()) {
      return false;
    }

    const hadReleaseAfterJump =
      getLastReleaseTimestamp() > getLastJumpTimestamp();

    if (!hadReleaseAfterJump) {
      return false;
    }

    return true;
  };

  const executeDoubleJump = (): boolean => {
    if (!canExecuteDoubleJump()) {
      return false;
    }

    player.doubleJump(DOUBLE_JUMP_FORCE);
    jumpsPerformed = 2;
    onJumpExecuted();
    return true;
  };

  const notifyFirstJumpExecuted = (): void => {
    jumpsPerformed = 1;
  };

  const resetOnGrounded = (): void => {
    if (player.isGrounded()) {
      jumpsPerformed = 0;
    }
  };

  const resetEachFrame = (): void => {
    syncDoubleJumpUnlock();
    resetOnGrounded();
  };

  return {
    executeDoubleJump,
    notifyFirstJumpExecuted,
    resetEachFrame,
  };
}
