import { PLAYER_ANIMATIONS } from "../../../types/animations.enum";
import type { Engine } from "../../../types/engine.interface";
import type { Player } from "../../../types/player.interface";
import { PLAYER_STATE, type PlayerStateMachine } from "./player-state-machine";

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
  engine.onUpdate(() => {
    const state = stateMachine.getState();
    const currentAnim = player.curAnim();

    if (player.isAttacking) return;

    if (state === PLAYER_STATE.IDLE && currentAnim !== PLAYER_ANIMATIONS.IDLE) {
      player.play(PLAYER_ANIMATIONS.IDLE);
    } else if (
      state === PLAYER_STATE.RUN &&
      currentAnim !== PLAYER_ANIMATIONS.RUN &&
      player.isGrounded()
    ) {
      player.play(PLAYER_ANIMATIONS.RUN);
    } else if (
      state === PLAYER_STATE.JUMP &&
      currentAnim !== PLAYER_ANIMATIONS.JUMP
    ) {
      player.play(PLAYER_ANIMATIONS.JUMP);
    } else if (
      state === PLAYER_STATE.FALL &&
      currentAnim !== PLAYER_ANIMATIONS.FALL
    ) {
      player.play(PLAYER_ANIMATIONS.FALL);
    }
  });
}
