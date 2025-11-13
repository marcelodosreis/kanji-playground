import type { CollidersEngineGameObj, Engine } from "../types/engine.type";
import type { Map } from "../types/map.interface";
import type { TiledMap } from "../types/tiled-map.interface";
import { BossBarrierSystem } from "../systems/map/boss-barrier.system";
import { CollisionSystem } from "../systems/map/collision.system";
import { ExitSystem } from "../systems/map/exit.system";

type SetupParams = {
  engine: Engine;
  tiledMap: TiledMap;
  gravity: number;
  mapSpriteName: string;
  exitRoomName: string;
};

export class MapManager {
  public static setup(params: SetupParams): {
    map: Map;
    colliders: CollidersEngineGameObj[];
  } {
    const manager = new MapManager();
    return manager.setupInstance(params);
  }

  private setupInstance({
    engine,
    tiledMap,
    gravity,
    mapSpriteName,
    exitRoomName,
  }: SetupParams): { map: Map; colliders: CollidersEngineGameObj[] } {
    this.configureEngine(engine, gravity);
    const map = this.createMap(engine, mapSpriteName);

    const colliders = CollisionSystem({ engine, map, tiledMap });
    BossBarrierSystem({ engine, map, tiledMap });
    ExitSystem({ engine, map, tiledMap, exitRoomName });

    return { map, colliders };
  }

  private configureEngine(engine: Engine, gravity: number): void {
    engine.setGravity(gravity);
  }

  private createMap(engine: Engine, spriteName: string): Map {
    return engine.add([engine.pos(0, 0), engine.sprite(spriteName)]);
  }
}
