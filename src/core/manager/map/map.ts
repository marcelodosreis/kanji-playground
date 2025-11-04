import type { Engine } from "../../../types/engine";
import type { Map } from "../../../types/map";
import type { TiledMap, TiledObject } from "../../../types/tiled-map";
import { BossBarrierManager } from "./boss-barrier";
import { ColliderManager } from "./collider";

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
    const {
      engine,
      tiledMap,
      setMap,
      cameraScale,
      initialCameraPos,
      gravity,
      mapSpriteName,
      collidersLayerIndex,
    } = params;

    this.configureEngine(engine, cameraScale, initialCameraPos, gravity);

    const map = this.createMap(engine, mapSpriteName);
    setMap(map);

    const colliders = this.extractColliders(tiledMap, collidersLayerIndex);

    this.processColliders(engine, map, colliders);
    this.processBossBarriers(engine, map, colliders);
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

  private static processColliders(
    engine: Engine,
    map: Map,
    colliders: TiledObject[]
  ): void {
    ColliderManager.processColliders(engine, map, colliders);
  }

  private static processBossBarriers(
    engine: Engine,
    map: Map,
    colliders: TiledObject[]
  ): void {
    colliders
      .filter(BossBarrierManager.isBossBarrier)
      .forEach((collider) =>
        BossBarrierManager.addBossBarrier(engine, map, collider)
      );
  }
}
