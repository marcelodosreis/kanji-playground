import type { Engine } from "../../types/engine.type";
import type { Player } from "../../types/player.interface";
import type { PlayerStateMachine } from "./player-state-machine";
import { PLAYER_ANIMATIONS } from "../../types/animations.enum";
import type { PlayerSystemWithAPI } from "../../types/player-system.interface";

type Params = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
};

const shouldSkipAnimationChange = (
  state: PLAYER_ANIMATIONS,
  player: Player
): boolean => {
  if (state === PLAYER_ANIMATIONS.RUN && !player.isGrounded()) {
    return true;
  }
  return false;
};

export function PlayerAnimationSystem({
  engine,
  player,
  stateMachine,
}: Params): PlayerSystemWithAPI<{}> {
  let lastState: PLAYER_ANIMATIONS | null = null;

  const playAnimation = (state: PLAYER_ANIMATIONS): void => {
    player.play(state);
  };

  const update = (): void => {
    const currentState = stateMachine.getState() as PLAYER_ANIMATIONS;

    if (currentState === lastState) return;

    if (shouldSkipAnimationChange(currentState, player)) return;

    playAnimation(currentState);
    lastState = currentState;
  };

  engine.onUpdate(update);

  return {
    update,
  };
}
