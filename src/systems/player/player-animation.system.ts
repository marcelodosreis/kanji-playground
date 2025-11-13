import type { Engine } from "../../types/engine.type";
import type { Player } from "../../types/player.interface";
import { type PlayerStateMachine } from "./player-state-machine";
import { PLAYER_ANIMATIONS } from "../../types/animations.enum";

type Params = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
};

export function PlayerAnimationSystem({
  engine,
  player,
  stateMachine,
}: Params) {
  let lastState: PLAYER_ANIMATIONS | null = null;

  const playAnimation = (state: PLAYER_ANIMATIONS): void => {
    player.play(state);
  };

  const shouldSkipAnimationChange = (state: PLAYER_ANIMATIONS): boolean => {
    if (state === PLAYER_ANIMATIONS.RUN && !player.isGrounded()) {
      return true;
    }
    return false;
  };

  engine.onUpdate(() => {
    const currentState = stateMachine.getState() as PLAYER_ANIMATIONS;

    if (currentState === lastState) return;

    if (shouldSkipAnimationChange(currentState)) return;

    playAnimation(currentState);
    lastState = currentState;
  });
}
