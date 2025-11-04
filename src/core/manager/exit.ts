import type { Engine } from "../../types/engine";
import type { Map } from "../../types/map";
import type { TiledMap, TiledObject } from "../../types/tiled-map";
import { setExitZones } from "../../utils/set-exit-zones";

type SetupParams = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
  exitsLayerIndex: number;
  exitRoomName: string;
};

export class ExitManager {
  static setup(params: SetupParams): void {
    const { engine, map, tiledMap, exitsLayerIndex, exitRoomName } = params;

    const exits = tiledMap.layers[exitsLayerIndex].objects as TiledObject[];
    setExitZones(engine, map, exits, exitRoomName);
  }
}
