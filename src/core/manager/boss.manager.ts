import { BossEntity } from "../entities/boss.entity";
import type { Engine } from "../../types/engine.interface";
import type { Map } from "../../types/map.interface";
import type { TiledMap, TiledObject } from "../../types/tiled-map.interface";
import type { Boss } from "../../types/boss.interface";
import { BossBehaviorSystem } from "../system/boss-behavior.system";
import { BossEventSystem } from "../system/boss-event.system";

type BossManagerParams = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
  isBossDefeated: boolean;
};

export class BossManager {
  public static setup(params: BossManagerParams): void {
    if (params.isBossDefeated) return;

    const bossPosition = this.getBossPosition(params.tiledMap);
    if (!bossPosition) return;

    const boss = params.map.add<Boss>(
      BossEntity(
        params.engine,
        params.engine.vec2(bossPosition.x, bossPosition.y)
      )
    );

    this.initSystems(params.engine, boss);
  }

  private static initSystems(engine: Engine, boss: Boss) {
    BossBehaviorSystem(engine, boss);
    BossEventSystem(engine, boss);
  }

  private static getBossPosition(tiledMap: TiledMap): TiledObject | undefined {
    return tiledMap.layers[5].objects?.find((pos) => pos.name === "boss");
  }
}
