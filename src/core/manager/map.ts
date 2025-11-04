import type { Engine } from "../../types/engine";
import type { Map } from "../../types/map";
import type { TiledMap, TiledObject } from "../../types/tiled-map";
import { setBackgroundColor } from "../../utils/set-background-color";
import { setMapCollider } from "../../utils/set-map-collider";

type SetupParams = {
  engine: Engine;
  tiledMap: TiledMap;
  config: {
    backgroundColor: string;
    cameraScale: number;
    initialCameraPos: { x: number; y: number };
    gravity: number;
    mapSpriteName: string;
    collidersLayerIndex: number;
  };
  setMap: (map: Map) => void;
};

export class MapManager {
  static setup(params: SetupParams): void {
    const { engine, tiledMap, config, setMap } = params;

    setBackgroundColor(engine, config.backgroundColor);
    engine.camScale(config.cameraScale);
    engine.camPos(config.initialCameraPos.x, config.initialCameraPos.y);
    engine.setGravity(config.gravity);

    const map = engine.add([
      engine.pos(0, 0),
      engine.sprite(config.mapSpriteName),
    ]);
    setMap(map);

    const colliders = tiledMap.layers[config.collidersLayerIndex]
      .objects as TiledObject[];
    setMapCollider(engine, map, colliders);
  }
}
