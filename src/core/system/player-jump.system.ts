import { PLAYER_ANIMATIONS } from "../../types/animations.enum";
import type { Engine } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";
import { GLOBAL_STATE } from "../../types/state.interface";
import { isPaused } from "../../utils/wrap-with-pause-check";
import { state } from "../global-state-controller";

type Params = {
  engine: Engine;
  player: Player;
};

export function PlayerJumpSystem({ engine, player }: Params) {
  let savedVelocity = { x: 0, y: 0 };
  const originalGravityScale = player.gravityScale;

  async function handleJumpKey(key: string) {
    if (isPaused()) return;
    if (key === "x") {
      if (state.current().isDoubleJumpUnlocked && player.numJumps !== 2) {
        player.numJumps = 2;
      }
      player.doubleJump();

      const cur = player.curAnim();

      if (
        cur !== PLAYER_ANIMATIONS.JUMP &&
        cur !== PLAYER_ANIMATIONS.FALL &&
        cur !== undefined &&
        !player.isAttacking
      ) {
        player.play(PLAYER_ANIMATIONS.JUMP);
      }
    }
  }

  function handlePauseChange(isPaused: boolean) {
    if (isPaused) {
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

  state.subscribe(GLOBAL_STATE.IS_PAUSED, handlePauseChange);

  player.controlHandlers.push(engine.onKeyPress(handleJumpKey));
}
