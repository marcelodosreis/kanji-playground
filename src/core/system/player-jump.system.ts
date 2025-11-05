import type { Engine } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";

type Params = {
  engine: Engine;
  player: Player;
};

export function PlayerJumpSystem({ engine, player }: Params) {
  const handleJumpKey = async (key: string) => {
    if (key === "x") {
      if (player.curAnim() !== "jump" && !player.isAttacking) {
        player.play("jump");
      }
      player.doubleJump();
    }
  };

  player.controlHandlers.push(engine.onKeyPress(handleJumpKey));
}
