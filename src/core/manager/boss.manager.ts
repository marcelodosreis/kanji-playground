import { BossEntity } from "../entities/boss.entity";
import type { Engine } from "../../types/engine.type";
import type { Map } from "../../types/map.interface";
import type { TiledMap, TiledObject } from "../../types/tiled-map.interface";
import type { Boss } from "../../types/boss.interface";
import { TAGS } from "../../types/tags.enum";
import { AIBossSystem } from "../system/ai-boss.system";
import { BossEventHandlerSystem } from "../system/boss-event-handler.system";import { MapLayer, MapLayerHelper } from "../../utils/map-layer-helper";
;

type BossManagerParams = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
  isBossDefeated: boolean;
};

export class BossManager {
  public static setup({
    engine,
    map,
    tiledMap,
    isBossDefeated,
  }: BossManagerParams): void {
    if (isBossDefeated) return;

    const bossPosition = this.getBossPosition(tiledMap);
    if (!bossPosition) return;

    const boss = map.add<Boss>(
      BossEntity(engine, engine.vec2(bossPosition.x, bossPosition.y))
    );

    this.initSystems(engine, boss);
  }

  private static initSystems(engine: Engine, boss: Boss): void {
    AIBossSystem({ engine, boss });
    BossEventHandlerSystem({ engine, boss });
  }

  private static getBossPosition(tiledMap: TiledMap): TiledObject | undefined {
    const objects = MapLayerHelper.getObjects(tiledMap, MapLayer.PIN);
    return objects.find((pos) => pos.name === TAGS.BOSS);
  }
}
