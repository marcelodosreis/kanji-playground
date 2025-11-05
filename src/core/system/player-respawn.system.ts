import type { Engine } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";
import { state } from "../state";

type Params = {
  engine: Engine;
  player: Player;
  boundValue: number;
  destinationName: string;
  previousSceneData: { exitName?: string };
};

export function PlayerRespawnSystem({
  engine,
  player,
  boundValue,
  destinationName,
  previousSceneData,
}: Params) {
  function checkOutOfBounds() {
    if (player.pos.y > boundValue) {
      engine.go(destinationName, previousSceneData);
    }
  }

  function onExplodeAnimationEnd(anim: string) {
    if (anim === "explode") {
      state.set("playerHp", state.current().maxPlayerHp);
      engine.go("room001", { exitName: null });
    }
  }

  engine.onUpdate(checkOutOfBounds);
  player.onAnimEnd(onExplodeAnimationEnd);
}
