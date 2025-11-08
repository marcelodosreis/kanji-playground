import type { Engine } from "../../../types/engine.type";
import type { Player } from "../../../types/player.interface";
import { type PlayerStateMachine } from "./player-state-machine";
import { PLAYER_ANIMATIONS } from "../../../types/animations.enum";

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
  let lastApplied: PLAYER_ANIMATIONS = PLAYER_ANIMATIONS.IDLE;

  engine.onUpdate(() => {
    if (stateMachine.isAttacking()) return;

    const state = stateMachine.getState() as PLAYER_ANIMATIONS;

    if (state === PLAYER_ANIMATIONS.RUN && !player.isGrounded()) return;

    if (state !== lastApplied) {
      player.play(state);
      lastApplied = state;
    }
  });
}
