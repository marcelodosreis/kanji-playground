import { state } from "../core/state";
import type { Engine } from "../types/engine";
import type { Map } from "../types/map";
import type { Player } from "../types/player";
import type { TiledMap } from "../types/tiled-map";

export function setCameraControl(
  engine: Engine,
  map: Map,
  player: Player,
  tiledMap: TiledMap
) {
  engine.onUpdate(() => {
    if (state.current().isPlayerInBossFight) return;

    if (map.pos.x + 160 > player.pos.x) {
      engine.camPos(map.pos.x + 160, engine.camPos().y);
      return;
    }

    if (player.pos.x > map.pos.x + tiledMap.width * tiledMap.tilewidth - 160) {
      engine.camPos(
        map.pos.x + tiledMap.width * tiledMap.tilewidth - 160,
        engine.camPos().y
      );
      return;
    }

    engine.camPos(player.pos.x, engine.camPos().y);
  });
}
