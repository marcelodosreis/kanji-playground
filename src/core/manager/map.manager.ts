import type { Engine } from "../../types/engine.interface";
import type { Map } from "../../types/map.interface";
import type { TiledMap, TiledObject } from "../../types/tiled-map.interface";
import { BossBarrierManager } from "./boss-barrier.manager";
import { ColliderManager } from "./collider.manager";

type SetupParams = {
  engine: Engine;
  tiledMap: TiledMap;
  setMap: (map: Map) => void;
  cameraScale: number;
  initialCameraPos: { x: number; y: number };
  gravity: number;
  mapSpriteName: string;
  collidersLayerIndex: number;
};

export class MapManager {
  static setup(params: SetupParams): void {
    this.configureEngine(
      params.engine,
      params.cameraScale,
      params.initialCameraPos,
      params.gravity
    );

    const map = this.createMap(params.engine, params.mapSpriteName);
    params.setMap(map);

    const colliders = this.extractColliders(
      params.tiledMap,
      params.collidersLayerIndex
    );

    ColliderManager.setup(params.engine, map, colliders);
    this.processBossBarriers(params.engine, map, colliders);
  }

  private static configureEngine(
    engine: Engine,
    cameraScale: number,
    initialCameraPos: { x: number; y: number },
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
    layerIndex: number
  ): TiledObject[] {
    return tiledMap.layers[layerIndex].objects as TiledObject[];
  }

  private static processBossBarriers(
    engine: Engine,
    map: Map,
    colliders: TiledObject[]
  ): void {
    colliders
      .filter(BossBarrierManager.isBossBarrier)
      .forEach((collider) =>
        BossBarrierManager.setup(engine, map, collider)
      );
  }
}
