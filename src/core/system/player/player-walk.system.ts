import type { Engine } from "../../../types/engine.interface";
import type { Player } from "../../../types/player.interface";
import { isPaused } from "../../../utils/wrap-with-pause-check";
import { PLAYER_STATE, type PlayerStateMachine } from "./player-state-machine";

type Params = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
};

export function PlayerWalkSystem({ engine, player, stateMachine }: Params) {
  let isMoving = false;

  function move(direction: -1 | 1) {
    isMoving = true;

    if (player.isAttacking) {
      player.move(direction * player.speed, 0);
      return;
    }

    const state = stateMachine.getState();
    if (
      !player.isAttacking &&
      player.isGrounded() &&
      state !== PLAYER_STATE.RUN &&
      state !== PLAYER_STATE.ATTACK
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
    const state = stateMachine.getState();
    const leftPressed = engine.isKeyDown("left");
    const rightPressed = engine.isKeyDown("right");

    if (!leftPressed && !rightPressed && isMoving) {
      isMoving = false;
      if (state === PLAYER_STATE.RUN && player.isGrounded()) {
        stateMachine.dispatch("IDLE");
      }
    }
  });

  player.controlHandlers.push(engine.onKeyDown(handleMovementKeyDown));
}
