import type { Engine } from "../../types/engine";
import type { Map } from "../../types/map";
import type { Player } from "../../types/player";
import type { TiledMap, TiledObject } from "../../types/tiled-map";
import { setCameraControl } from "../../utils/set-camera-control";
import { setCameraZones } from "../../utils/set-camera-zones";

type CameraSetupParams = {
  engine: Engine;
  map: Map;
  player: Player;
  tiledMap: TiledMap;
  cameraZonesLayerIndex: number;
  initialCameraPos: { x: number; y: number };
  previousSceneExitName?: string | null;
};

export class CameraManager {
  static setup(params: CameraSetupParams): void {
    const {
      engine,
      map,
      player,
      tiledMap,
      cameraZonesLayerIndex,
      previousSceneExitName,
    } = params;

    if (!previousSceneExitName) {
      engine.camPos(params.initialCameraPos.x, params.initialCameraPos.y);
    } else {
      engine.camPos(player.pos);
    }

    setCameraControl(engine, map, player, tiledMap);

    const cameras = tiledMap.layers[cameraZonesLayerIndex]
      .objects as TiledObject[];
    setCameraZones(engine, map, cameras);
  }
}
