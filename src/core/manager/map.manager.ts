import type { Engine } from "../../types/engine.interface";
import type { Map } from "../../types/map.interface";
import type { TiledMap, TiledObject } from "../../types/tiled-map.interface";
import { BossBarrierManager } from "./boss-barrier.manager";
import { ColliderManager } from "./collider.manager";

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

    ColliderManager.setup(engine, map, colliders);
    this.processBossBarriers(engine, map, colliders);
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

  private static extractColliders(
    tiledMap: TiledMap,
  ): TiledObject[] {
    return tiledMap.layers[4].objects as TiledObject[];
  }

  private static processBossBarriers(
    engine: Engine,
    map: Map,
    colliders: TiledObject[]
  ): void {
    colliders
      .filter(BossBarrierManager.isBossBarrier)
      .forEach((collider) => {
        BossBarrierManager.setup(engine, map, collider)
      });
  }
}
