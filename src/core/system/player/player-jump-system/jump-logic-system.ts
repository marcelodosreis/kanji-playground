import type { Player } from "../../../../types/player.interface";
import { GLOBAL_STATE } from "../../../../types/global-state.enum";
import { GLOBAL_STATE_CONTROLLER } from "../../../global-state-controller";

type JumpLogicParams = {
  player: Player;
  onJumpExecuted: () => void;
};

const MAX_JUMPS = 2;

export function PlayerJumpLogicSystem({
  player,
  onJumpExecuted,
}: JumpLogicParams) {
  let jumpsPerformed = 0;
  let wasGrounded = player.isGrounded();

  const syncDoubleJumpUnlock = (): void => {
    const isUnlocked =
      GLOBAL_STATE_CONTROLLER.current()[GLOBAL_STATE.IS_DOUBLE_JUMB_UNLOCKED];
    if (isUnlocked && player.numJumps !== MAX_JUMPS) {
      player.numJumps = MAX_JUMPS;
    }
  };

  const executeJump = (): boolean => {
    if (player.isGrounded()) {
      player.doubleJump();
      jumpsPerformed = 1;
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
    if (executeJump()) {
      onJumpExecuted();
    }
  };

  const resetJumpsOnLanding = (): void => {
    const isGrounded = player.isGrounded();
    if (isGrounded && !wasGrounded) {
      jumpsPerformed = 0;
    }
    wasGrounded = isGrounded;
  };

  return {
    handleJumpRequest,
    resetJumpsOnLanding,
  };
}