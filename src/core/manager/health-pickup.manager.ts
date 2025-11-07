import { HealthPickupEntity } from "../entities/health-pickup.entity";
import type { Engine, EngineGameObj } from "../../types/engine.interface";
import type { Map } from "../../types/map.interface";
import type { TiledMap, TiledObject } from "../../types/tiled-map.interface";
import { HealthPickupSystem } from "../system/health-pickup.system";
import { TAGS } from "../../types/tags.enum";

type SpawnParams = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
};

export class HealthPickupManager {
  public static setup({ engine, map, tiledMap }: SpawnParams): void {
    const positions = tiledMap.layers[5].objects as TiledObject[];

    positions
      .filter((pos) => pos.type === TAGS.HEALTH_PICKUP)
      .forEach((pos) => {
        const healthPickup = map.add(
          HealthPickupEntity(engine, engine.vec2(pos.x, pos.y))
        );

        this.initSystems(engine, healthPickup);
      });
  }

  private static initSystems(engine: Engine, healthPickup: EngineGameObj): void {
    HealthPickupSystem({ engine, healthPickup });
  }
}
