import type { Engine } from "../../types/engine";
import type { Map } from "../../types/map";
import type { Player } from "../../types/player";
import type { TiledMap, TiledObject } from "../../types/tiled-map";
import { state } from "../state";

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

    engine.onUpdate(() => {
      if (state.current().isPlayerInBossFight) return;

      if (map.pos.x + 160 > player.pos.x) {
        engine.camPos(map.pos.x + 160, engine.camPos().y);
        return;
      }

      if (
        player.pos.x >
        map.pos.x + tiledMap.width * tiledMap.tilewidth - 160
      ) {
        engine.camPos(
          map.pos.x + tiledMap.width * tiledMap.tilewidth - 160,
          engine.camPos().y
        );
        return;
      }

      engine.camPos(player.pos.x, engine.camPos().y);
    });

    const cameras = tiledMap.layers[cameraZonesLayerIndex]
      .objects as TiledObject[];
    for (const camera of cameras) {
      const cameraZone = map.add([
        engine.area({
          shape: new engine.Rect(engine.vec2(0), camera.width, camera.height),
          collisionIgnore: ["collider"],
        }),
        engine.pos(camera.x, camera.y),
      ]);

      cameraZone.onCollide("player", () => {
        if (engine.camPos().x !== camera.properties[0].value) {
          engine.tween(
            engine.camPos().y,
            camera.properties[0].value,
            0.8,
            (val) => engine.camPos(engine.camPos().x, val),
            engine.easings.linear
          );
        }
      });
    }
  }
}
