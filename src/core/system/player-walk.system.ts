import { PLAYER_ANIMATIONS } from "../../types/animations.enum";
import type { Engine } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";
import { isPaused } from "../../utils/wrap-with-pause-check";

type Params = {
  engine: Engine;
  player: Player;
};

export function PlayerWalkSystem({ engine, player }: Params) {
  function move(direction: -1 | 1) {
    if (player.isAttacking) {
      player.move(direction * player.speed, 0);
      return;
    }

    if (
      !player.isAttacking &&
      player.curAnim() !== PLAYER_ANIMATIONS.RUN &&
      player.isGrounded()
    ) {
      player.play(PLAYER_ANIMATIONS.RUN);
    }

    player.flipX = direction === -1;
    player.move(direction * player.speed, 0);
  }

  const handleMovementKeyDown = (key: string) => {
    if (isPaused()) return;

    if (key === "left") {
      move(-1);
    } else if (key === "right") {
      move(1);
    }
  };

  player.controlHandlers.push(engine.onKeyDown(handleMovementKeyDown));
}