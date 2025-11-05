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
      anim !== "idle" &&
      anim !== "jump" &&
      anim !== "fall" &&
      anim !== "attack"
    ) {
      player.play("idle");
    }
  }

  player.controlHandlers.push(engine.onKeyRelease(handleKeyRelease));
}
