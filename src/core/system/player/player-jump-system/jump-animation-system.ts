import { PLAYER_ANIMATIONS } from "../../../../types/animations.enum";
import type { Player } from "../../../../types/player.interface";
import { type PlayerStateMachine } from "../player-state-machine";

type JumpAnimationParams = {
  player: Player;
  stateMachine: PlayerStateMachine;
};

const JUMP_END_FRAME = 4;
const AERIAL_STATES = [PLAYER_ANIMATIONS.JUMP, PLAYER_ANIMATIONS.FALL];

const isAerialState = (state: string): boolean =>
  AERIAL_STATES.includes(state as PLAYER_ANIMATIONS);

const shouldEnterFall = (
  currentState: string,
  animFrame: number,
  grounded: boolean
): boolean =>
  currentState === PLAYER_ANIMATIONS.JUMP &&
  animFrame >= JUMP_END_FRAME &&
  !grounded;

const shouldEnterIdle = (currentState: string, grounded: boolean): boolean =>
  grounded && isAerialState(currentState);

export function PlayerJumpAnimationSystem({
  player,
  stateMachine,
}: JumpAnimationParams) {
  const updateAnimationState = (): void => {
    const currentState = stateMachine.getState();
    const isGrounded = player.isGrounded();

    if (shouldEnterIdle(currentState, isGrounded)) {
      stateMachine.dispatch("IDLE");
      return;
    }

    if (shouldEnterFall(currentState, player.animFrame, isGrounded)) {
      stateMachine.dispatch("FALL");
    }
  };

  return {
    updateAnimationState,
  };
}
