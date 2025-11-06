import { DroneEntity } from "../entities/drone.entity";
import type { Engine } from "../../types/engine.interface";
import type { Map } from "../../types/map.interface";
import type { TiledMap, TiledObject } from "../../types/tiled-map.interface";
import type { Enemy } from "../../types/enemy.interface";
import { DroneEventHandlerSystem } from "../system/drone-event-handler.system";
import { AIDroneSystem } from "../system/ai-drone.system";
import { TAGS } from "../../types/tags.enum";
import { DronePositionResetSystem } from "../system/drone-position-reset.system";

type EnemyManagerParams = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
};

export class EnemyManager {
  public static setup({ engine, map, tiledMap }: EnemyManagerParams): void {
    const positions = this.getSpawnPositions(tiledMap);
    this.spawnDrones(engine, map, positions);
  }

  private static initSystems(engine: Engine, drone: Enemy): void {
    DroneEventHandlerSystem({ engine, drone });
    AIDroneSystem({ engine, drone });
    DronePositionResetSystem({ drone });
  }

  private static getSpawnPositions(tiledMap: TiledMap): TiledObject[] {
    return tiledMap.layers[5].objects as TiledObject[];
  }

  private static spawnDrones(
    engine: Engine,
    map: Map,
    positions: TiledObject[]
  ): void {
    positions
      .filter((pos) => pos.type === TAGS.DRONE)
      .forEach((pos) => this.spawnDrone(engine, map, pos));
  }

  private static spawnDrone(engine: Engine, map: Map, pos: TiledObject): void {
    const drone = map.add<Enemy>(
      DroneEntity(engine, engine.vec2(pos.x, pos.y))
    );
    this.initSystems(engine, drone);
  }
}
