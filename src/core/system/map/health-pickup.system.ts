import { GLOBAL_STATE_CONTROLLER } from "../../global-state-controller";
import type { Engine, EngineGameObj } from "../../../types/engine.type";
import type { Map } from "../../../types/map.interface";
import type { TiledMap } from "../../../types/tiled-map.interface";
import type { Player } from "../../../types/player.interface";
import { MapLayer, MapLayerHelper } from "../../../utils/map-layer-helper";
import { TAGS } from "../../../types/tags.enum";
import { HealthPickupEntity } from "../../entities/health-pickup.entity";

type Params = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
};

export function HealthPickupSystem({ engine, map, tiledMap }: Params) {
  const positions = MapLayerHelper.getObjects(tiledMap, MapLayer.PIN);
  positions
    .filter((pos) => pos.type === TAGS.HEALTH_PICKUP)
    .forEach((pos) => {
      const pickup = map.add(
        HealthPickupEntity(engine, engine.vec2(pos.x, pos.y))
      );
      registerPickupBehavior({ engine, healthPickup: pickup });
    });
}

function registerPickupBehavior(params: {
  engine: Engine;
  healthPickup: EngineGameObj;
}) {
  const { engine, healthPickup } = params;

  function onPlayerCollision(player: Player) {
    if (player.hp() < GLOBAL_STATE_CONTROLLER.current().maxPlayerHp) {
      player.heal(1);
    }
    engine.destroy(healthPickup);
  }

  healthPickup.onCollide(TAGS.PLAYER, onPlayerCollision);
}
