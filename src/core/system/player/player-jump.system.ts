import { PLAYER_ANIMATIONS } from "../../../types/animations.enum";
import type { Engine } from "../../../types/engine.interface";
import type { Player } from "../../../types/player.interface";
import { GLOBAL_STATE } from "../../../types/state.interface";
import { isPaused } from "../../../utils/wrap-with-pause-check";
import { state } from "../../global-state-controller";
import { type PlayerStateMachine } from "./player-state-machine";

type Params = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
};

export function PlayerJumpSystem({ engine, player, stateMachine }: Params) {
  let savedVelocity = { x: 0, y: 0 };
  const originalGravityScale = player.gravityScale;
  const JUMP_LAST_FRAME = 4;

  async function handleJumpKey(key: string) {
    if (isPaused()) return;
    if (key !== "x") return;
    if (!stateMachine.canMove()) return;
    if (state.current().isDoubleJumpUnlocked && player.numJumps !== 2) {
      player.numJumps = 2;
    }
    player.doubleJump();

    const cur = player.curAnim();
    if (
      cur !== PLAYER_ANIMATIONS.JUMP &&
      cur !== PLAYER_ANIMATIONS.FALL &&
      cur !== undefined &&
      !stateMachine.isAttacking() &&
      stateMachine.getState() !== PLAYER_ANIMATIONS.JUMP
    ) {
      stateMachine.dispatch("JUMP");
    }
  }

  function handlePauseChange(paused: boolean) {
    if (paused) {
      savedVelocity = { x: player.vel.x, y: player.vel.y };
      player.vel.x = 0;
      player.vel.y = 0;
      player.gravityScale = 0;
    } else {
      player.gravityScale = originalGravityScale;
      player.vel.x = savedVelocity.x;
      player.vel.y = savedVelocity.y;
    }
  }

  engine.onUpdate(() => {
    const current = stateMachine.getState();
    const isGrounded = player.isGrounded();

    if (
      isGrounded &&
      (current === PLAYER_ANIMATIONS.JUMP || current === PLAYER_ANIMATIONS.FALL)
    ) {
      stateMachine.dispatch("IDLE");
      return;
    }

    if (
      current === PLAYER_ANIMATIONS.JUMP &&
      player.animFrame >= JUMP_LAST_FRAME
    ) {
      if (!isGrounded) {
        stateMachine.dispatch("FALL");
      }
    }
  });

  state.subscribe(GLOBAL_STATE.IS_PAUSED, handlePauseChange);

  player.controlHandlers = player.controlHandlers || [];
  player.controlHandlers.push(engine.onKeyPress(handleJumpKey));
}
