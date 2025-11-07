import { PLAYER_ANIMATIONS } from "../../../types/animations.enum";
import type { Engine } from "../../../types/engine.interface";
import type { Player } from "../../../types/player.interface";
import { isPaused } from "../../../utils/wrap-with-pause-check";
import { type PlayerStateMachine } from "./player-state-machine";

type Params = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
};

export function PlayerWalkSystem({ engine, player, stateMachine }: Params) {
  let isMoving = false;

  function move(direction: -1 | 1) {
    if (!stateMachine.canMove()) {
      return;
    }

    isMoving = true;

    if (stateMachine.isAttacking()) {
      player.move(direction * player.speed, 0);
      return;
    }

    const current = stateMachine.getState();
    if (
      player.isGrounded() &&
      current !== PLAYER_ANIMATIONS.RUN &&
      current !== PLAYER_ANIMATIONS.ATTACK
    ) {
      stateMachine.dispatch("RUN");
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

  engine.onUpdate(() => {
    const current = stateMachine.getState();
    const leftPressed = engine.isKeyDown("left");
    const rightPressed = engine.isKeyDown("right");

    if (!leftPressed && !rightPressed && isMoving) {
      isMoving = false;
      if (current === PLAYER_ANIMATIONS.RUN && player.isGrounded()) {
        stateMachine.dispatch("IDLE");
      }
    }
  });

  player.controlHandlers = player.controlHandlers || [];
  player.controlHandlers.push(engine.onKeyDown(handleMovementKeyDown));
}
