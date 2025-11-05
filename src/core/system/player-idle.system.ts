import { PLAYER_ANIMATIONS } from "../../types/animations.enum";
import type { Engine } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";

type Params = {
  engine: Engine;
  player: Player;
};

export function PlayerIdleSystem({ engine, player }: Params) {
  function handleKeyRelease() {
    const anim = player.curAnim();
    if (
      anim !== PLAYER_ANIMATIONS.IDLE &&
      anim !== PLAYER_ANIMATIONS.JUMP &&
      anim !== PLAYER_ANIMATIONS.FALL &&
      anim !== PLAYER_ANIMATIONS.ATTACK
    ) {
      player.play(PLAYER_ANIMATIONS.IDLE);
    }
  }

  player.controlHandlers.push(engine.onKeyRelease(handleKeyRelease));
}
