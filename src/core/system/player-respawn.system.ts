import { PLAYER_ANIMATIONS } from "../../types/animations.enum";
import type { Engine } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";
import { LEVEL_SCENES } from "../../types/scenes.enum";
import { GLOBAL_STATE } from "../../types/state.interface";
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
      state.set(GLOBAL_STATE.PLAYER_HP, currentHp - 1);
      engine.go(destinationName, previousSceneData);
    }
  }

  function onExplodeAnimationEnd(anim: string) {
    if (anim === PLAYER_ANIMATIONS.EXPLODE) {
      respawnPlayerFullLife(state.current().maxPlayerHp);
    }
  }

  function respawnPlayerFullLife(maxHp: number) {
    state.set(GLOBAL_STATE.PLAYER_HP, maxHp);
    engine.go(LEVEL_SCENES.ROOM_001, { exitName: null });
  }

  engine.onUpdate(checkOutOfBounds);
  player.onAnimEnd(onExplodeAnimationEnd);
}
