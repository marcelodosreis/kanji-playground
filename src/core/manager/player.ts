import type { Engine, EngineGameObj } from "../../types/engine";
import type { Map } from "../../types/map";
import type { Player } from "../../types/player";
import type { TiledMap, TiledObject } from "../../types/tiled-map";
import { createPlayer } from "../../entities/player";

type SetupParams = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
  previousSceneData: EngineGameObj;
  playerStartNames: string[];
  entranceExitMapping: Record<string, string>;
  positionOffset?: { x: number; y: number };
  respawnConfig?: {
    bounds: number;
    roomName: string;
    exitName?: string;
  };
};

export class PlayerManager {
  static setup(params: SetupParams): Player {
    const {
      engine,
      map,
      tiledMap,
      previousSceneData,
      playerStartNames,
      entranceExitMapping,
      positionOffset,
      respawnConfig,
    } = params;

    const player = map.add<Player>(createPlayer(engine));

    const positions = tiledMap.layers[5].objects as TiledObject[];

    const startPosition = positions.find((position) => {
      if (
        position.name === "player" &&
        !previousSceneData.exitName &&
        playerStartNames.includes("player")
      ) {
        return true;
      }
      if (
        playerStartNames.includes(position.name) &&
        entranceExitMapping[position.name] === previousSceneData.exitName
      ) {
        return true;
      }
      return false;
    });

    if (startPosition) {
      const offsetX = positionOffset?.x ?? 0;
      const offsetY = positionOffset?.y ?? 0;
      player.setPosition(startPosition.x + offsetX, startPosition.y + offsetY);
    }

    player.setControls();
    player.enablePassthrough();
    player.setEvents();

    if (respawnConfig) {
      const { bounds, roomName } = respawnConfig;
      player.respawnIfOutOfBounds(bounds, roomName, { exitName: null });
    }

    return player;
  }
}
