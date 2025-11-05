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
    if (player.pos.y <= boundValue) return;

    const currentHp = state.current().playerHp;
    const maxHp = state.current().maxPlayerHp;

    if (currentHp <= 1) {
      respawnPlayerFullLife(maxHp);
    } else {
      state.set("playerHp", currentHp - 1);
      engine.go(destinationName, previousSceneData);
    }
  }

  function onExplodeAnimationEnd(anim: string) {
    if (anim === "explode") {
      respawnPlayerFullLife(state.current().maxPlayerHp);
    }
  }

  function respawnPlayerFullLife(maxHp: number) {
    state.set("playerHp", maxHp);
    engine.go("room001", { exitName: null });
  }

  engine.onUpdate(checkOutOfBounds);
  player.onAnimEnd(onExplodeAnimationEnd);
}
