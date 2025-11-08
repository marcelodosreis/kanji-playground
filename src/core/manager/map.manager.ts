import type { Engine } from "../../types/engine.interface";
import type { Map } from "../../types/map.interface";
import type { TiledMap } from "../../types/tiled-map.interface";
import { MapLayer, MapLayerHelper } from "../../utils/map-layer-helper";
import { BossBarrierEntity } from "../entities/boss-barrier.entity";
import {
  BossBarrierSystem,
  isBossBarrier,
} from "../system/map/boss-barrier.system";
import { ColliderSystem } from "../system/map/collider.system";
import { ExitSystem } from "../system/map/exit.system";
import { PauseSystem } from "../system/map/pause.system";
import { HealthPickupEntity } from "../entities/health-pickup.entity";
import { HealthPickupSystem } from "../system/map/health-pickup.system";
import { TAGS } from "../../types/tags.enum";

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
  exitRoomName: string;
};

export class MapManager {
  public static setup(params: SetupParams): void {
    const manager = new MapManager();
    manager.setupInstance(params);
  }

  private setupInstance({
    engine,
    tiledMap,
    setMap,
    cameraScale,
    initialCameraPos,
    gravity,
    mapSpriteName,
    exitRoomName,
  }: SetupParams): void {
    this.configureEngine(engine, cameraScale, initialCameraPos, gravity);

    const map = this.createMap(engine, mapSpriteName);
    setMap(map);

    this.setupColliders(engine, map, tiledMap);
    this.setupBossBarriers(engine, map, tiledMap);
    this.setupHealthPickups(engine, map, tiledMap);
    this.setupExits(engine, map, tiledMap, exitRoomName);
    this.setupPause(engine);
  }

  private configureEngine(
    engine: Engine,
    cameraScale: number,
    initialCameraPos: InitialCameraPos,
    gravity: number
  ): void {
    engine.camScale(cameraScale);
    engine.camPos(initialCameraPos.x, initialCameraPos.y);
    engine.setGravity(gravity);
  }

  private createMap(engine: Engine, spriteName: string): Map {
    return engine.add([engine.pos(0, 0), engine.sprite(spriteName)]);
  }

  private setupColliders(engine: Engine, map: Map, tiledMap: TiledMap): void {
    const colliders = MapLayerHelper.getObjects(tiledMap, MapLayer.COLLIDERS);
    ColliderSystem({ engine, map, colliders });
  }

  private setupBossBarriers(
    engine: Engine,
    map: Map,
    tiledMap: TiledMap
  ): void {
    const colliders = MapLayerHelper.getObjects(tiledMap, MapLayer.COLLIDERS);
    colliders.filter(isBossBarrier).forEach((collider) => {
      const bossBarrier = map.add(BossBarrierEntity(engine, collider));
      BossBarrierSystem({ engine, bossBarrier, collider });
    });
  }

  private setupHealthPickups(
    engine: Engine,
    map: Map,
    tiledMap: TiledMap
  ): void {
    const positions = MapLayerHelper.getObjects(tiledMap, MapLayer.PIN);
    positions
      .filter((pos) => pos.type === TAGS.HEALTH_PICKUP)
      .forEach((pos) => {
        const healthPickup = map.add(
          HealthPickupEntity(engine, engine.vec2(pos.x, pos.y))
        );
        HealthPickupSystem({ engine, healthPickup });
      });
  }

  private setupExits(
    engine: Engine,
    map: Map,
    tiledMap: TiledMap,
    exitRoomName: string
  ): void {
    ExitSystem({
      engine,
      map,
      tiledMap,
      exitRoomName,
    });
  }

  private setupPause(engine: Engine): void {
    PauseSystem({ engine });
  }
}
