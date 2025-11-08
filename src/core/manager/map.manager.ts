import type { Engine } from "../../types/engine.interface";
import type { Map } from "../../types/map.interface";
import type { TiledMap, TiledObject } from "../../types/tiled-map.interface";
import { BossBarrierEntity } from "../entities/boss-barrier.entity";
import {
  BossBarrierSystem,
  isBossBarrier,
} from "../system/boss-barrier.system";
import { ColliderSystem } from "../system/collider.system";
import { PauseSystem } from "../system/pause.system";

type InitialCameraPos = {
  x: number;
  y: number;
};

type SetupParams = {
  engine: Engine;
  tiledMap: TiledMap;
  setMap: (map: Map) => void;
  cameraScale: number;
  initialCameraPos: InitialCameraPos;
  gravity: number;
  mapSpriteName: string;
};

export class MapManager {
  static setup({
    engine,
    tiledMap,
    setMap,
    cameraScale,
    initialCameraPos,
    gravity,
    mapSpriteName,
  }: SetupParams): void {
    this.configureEngine(engine, cameraScale, initialCameraPos, gravity);

    const map = this.createMap(engine, mapSpriteName);
    setMap(map);

    const colliders = this.extractColliders(tiledMap);

    ColliderSystem({ engine, map, colliders });
    this.processBossBarriers(engine, map, colliders);
    PauseSystem.setup({ engine });
  }

  private static configureEngine(
    engine: Engine,
    cameraScale: number,
    initialCameraPos: InitialCameraPos,
    gravity: number
  ): void {
    engine.camScale(cameraScale);
    engine.camPos(initialCameraPos.x, initialCameraPos.y);
    engine.setGravity(gravity);
  }

  private static createMap(engine: Engine, spriteName: string): Map {
    return engine.add([engine.pos(0, 0), engine.sprite(spriteName)]);
  }

  private static extractColliders(tiledMap: TiledMap): TiledObject[] {
    return tiledMap.layers[4].objects as TiledObject[];
  }

  private static processBossBarriers(
    engine: Engine,
    map: Map,
    colliders: TiledObject[]
  ): void {
    colliders.filter(isBossBarrier).forEach((collider) => {
      const bossBarrier = map.add(BossBarrierEntity(engine, collider));
      BossBarrierSystem({ engine, bossBarrier, collider });
    });
  }
}
