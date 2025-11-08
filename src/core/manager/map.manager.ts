import type { Engine } from "../../types/engine.type";
import type { Map } from "../../types/map.interface";
import type { TiledMap } from "../../types/tiled-map.interface";
import { MapSystem } from "../system/map/map.system";
import { ExitSystem } from "../system/map/exit.system";

type SetupParams = {
  engine: Engine;
  tiledMap: TiledMap;
  gravity: number;
  mapSpriteName: string;
  exitRoomName: string;
};

export class MapManager {
  public static setup(params: SetupParams): Map {
    const manager = new MapManager();
    return manager.setupInstance(params);
  }

  private setupInstance({
    engine,
    tiledMap,
    gravity,
    mapSpriteName,
    exitRoomName,
  }: SetupParams): Map {
    this.configureEngine(engine, gravity);

    const map = this.createMap(engine, mapSpriteName);

    MapSystem({ engine, map, tiledMap });
    ExitSystem({
      engine,
      map,
      tiledMap,
      exitRoomName,
    });
    return map;
  }

  private configureEngine(engine: Engine, gravity: number): void {
    engine.setGravity(gravity);
  }

  private createMap(engine: Engine, spriteName: string): Map {
    return engine.add([engine.pos(0, 0), engine.sprite(spriteName)]);
  }
}
