import { PLAYER_ANIMATIONS } from "../../types/animations.enum";
import type { Engine } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";

type Params = {
  engine: Engine;
  player: Player;
};

export function PlayerJumpSystem({ engine, player }: Params) {
  const handleJumpKey = async (key: string) => {
    if (key === "x") {
      if (player.curAnim() !== PLAYER_ANIMATIONS.JUMP && !player.isAttacking) {
        player.play(PLAYER_ANIMATIONS.JUMP);
      }
      player.doubleJump();
    }
  };

  player.controlHandlers.push(engine.onKeyPress(handleJumpKey));
}
