import type { Player } from "../../../types/player.interface";
import { GLOBAL_STATE } from "../../../types/global-state.enum";
import { GLOBAL_STATE_CONTROLLER } from "../../../core/global-state-controller";
import type { PlayerStateMachine } from "../player-state-machine";
import { PLAYER_CONFIG } from "../../../constansts/player.constat";

type DoubleJumpParams = {
  player: Player;
  stateMachine: PlayerStateMachine;
  onJumpExecuted: () => void;
  getLastJumpTimestamp: () => number;
  getLastReleaseTimestamp: () => number;
};

const { maxJumps: MAX_JUMPS, doubleJumpForce: DOUBLE_JUMP_FORCE } =
  PLAYER_CONFIG.jump;

export function PlayerDoubleJumpSystem({
  player,
  stateMachine,
  onJumpExecuted,
  getLastJumpTimestamp,
  getLastReleaseTimestamp,
}: DoubleJumpParams) {
  const ctx = stateMachine.getContext();

  const syncDoubleJumpUnlock = (): void => {
    const isUnlocked =
      GLOBAL_STATE_CONTROLLER.current()[GLOBAL_STATE.IS_DOUBLE_JUMP_UNLOCKED];
    if (isUnlocked && player.numJumps !== MAX_JUMPS) {
      player.numJumps = MAX_JUMPS;
    }
  };

  const canExecuteDoubleJump = (): boolean => {
    if (ctx.jump.jumpsPerformed !== 1) return false;
    if (player.numJumps < 2) return false;
    if (player.isGrounded()) return false;

    const hadReleaseAfterJump =
      getLastReleaseTimestamp() > getLastJumpTimestamp();

    if (!hadReleaseAfterJump) return false;

    return true;
  };

  const executeDoubleJump = (): boolean => {
    if (!canExecuteDoubleJump()) return false;

    player.doubleJump(DOUBLE_JUMP_FORCE);
    ctx.jump.jumpsPerformed = 2;
    onJumpExecuted();
    return true;
  };

  const notifyFirstJumpExecuted = (): void => {
    ctx.jump.jumpsPerformed = 1;
  };

  const updateOnGrounded = (): void => {
    if (player.isGrounded()) {
      ctx.jump.jumpsPerformed = 0;
    }
  };

  const updateEachFrame = (): void => {
    syncDoubleJumpUnlock();
    updateOnGrounded();
  };

  return {
    executeDoubleJump,
    notifyFirstJumpExecuted,
    updateEachFrame,
  };
}
