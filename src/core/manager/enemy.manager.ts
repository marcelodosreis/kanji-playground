import { FlyingEnemyEntity } from "../entities/flying-enemy.entity";
import type { Engine } from "../../types/engine.interface";
import type { Map } from "../../types/map.interface";
import type { TiledMap, TiledObject } from "../../types/tiled-map.interface";
import type { Enemy } from "../../types/enemy.interface";
import { FlyingEnemyEventHandlerSystem } from "../system/flying-enemy-event-handler.system";
import { AIFlyingEnemySystem } from "../system/ai-flying-enemy.system";
import { TAGS } from "../../types/tags.enum";
import { FlyingEnemyPositionResetSystem } from "../system/flying-enemy-position-reset.system";

type EnemyManagerParams = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
};

export class EnemyManager {
  public static setup({ engine, map, tiledMap }: EnemyManagerParams): void {
    const positions = this.getSpawnPositions(tiledMap);
    this.spawn(engine, map, positions);
  }

  private static initSystems(engine: Engine, enemy: Enemy): void {
    FlyingEnemyEventHandlerSystem({ engine, enemy });
    AIFlyingEnemySystem({ engine, enemy });
    FlyingEnemyPositionResetSystem({ enemy });
  }

  private static getSpawnPositions(tiledMap: TiledMap): TiledObject[] {
    return tiledMap.layers[5].objects as TiledObject[];
  }

  private static spawn(
    engine: Engine,
    map: Map,
    positions: TiledObject[]
  ): void {
    positions
      .filter((pos) => pos.type === TAGS.FLY_ENEMY)
      .forEach((pos) => {
        const enemy = map.add<Enemy>(
          FlyingEnemyEntity(engine, engine.vec2(pos.x, pos.y))
        );
        this.initSystems(engine, enemy);
      });
  }
}
