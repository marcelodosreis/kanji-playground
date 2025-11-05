import type { Engine } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";

type Params = {
  engine: Engine;
  player: Player;
};

export function PlayerMovementSystem({ engine, player }: Params) {
  player.controlHandlers = [];

  function handleJumpKey(key: string) {
    if (key === "x") {
      if (player.curAnim() !== "jump" && !player.isAttacking) {
        player.play("jump");
      }
      player.doubleJump();
    }
  }

  function handleMovementKeyDown(key: string) {
    if (key === "left") {
      moveLeft();
    } else if (key === "right") {
      moveRight();
    }
  }

  function moveLeft() {
    if (player.isAttacking) {
      player.move(-player.speed, 0);
      return;
    }

    if (
      !player.isAttacking &&
      player.curAnim() !== "run" &&
      player.isGrounded()
    ) {
      player.play("run");
    }
    player.flipX = true;
    player.move(-player.speed, 0);
  }

  function moveRight() {
    if (player.isAttacking) {
      player.move(player.speed, 0);
      return;
    }

    if (
      !player.isAttacking &&
      player.curAnim() !== "run" &&
      player.isGrounded()
    ) {
      player.play("run");
    }
    player.flipX = false;
    player.move(player.speed, 0);
  }

  function handleKeyRelease() {
    const anim = player.curAnim();
    if (
      anim !== "idle" &&
      anim !== "jump" &&
      anim !== "fall" &&
      anim !== "attack"
    ) {
      player.play("idle");
    }
  }

  player.controlHandlers.push(engine.onKeyPress(handleJumpKey));
  player.controlHandlers.push(engine.onKeyDown(handleMovementKeyDown));
  player.controlHandlers.push(engine.onKeyRelease(handleKeyRelease));
}
