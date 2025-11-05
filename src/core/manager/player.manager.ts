import type { Engine, EngineGameObj } from "../../types/engine.interface";
import type { Map } from "../../types/map.interface";
import type { Player } from "../../types/player.interface";
import type { TiledMap, TiledObject } from "../../types/tiled-map.interface";
import { PlayerEntity } from "../entities/player.entity";
import { PlayerDoubleJumpSystem } from "../system/player-double-jump.system";
import { PlayerEventSystem } from "../system/player-event.system";
import { PlayerInputSystem } from "../system/player-input.system";
import { PlayerPassthroughSystem } from "../system/player-passthrough.system";
import { PlayerRespawnSystem } from "../system/player-respawn.system";

type SetupParams = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
  previousSceneData: EngineGameObj;
  playerStartNames: string[];
  entranceExitMapping: Record<string, string>;
  positionOffset?: { x: number; y: number };
  respawnConfig: {
    bounds: number;
    roomName: string;
    exitName?: string;
  };
};

export class PlayerManager {
  public static setup(params: SetupParams): Player {
    const player = this.createPlayer(params);
    const startPosition = this.findStartPosition(params);

    this.initSystems(
      params.engine,
      player,
      params.respawnConfig.roomName,
      params.respawnConfig.exitName
    );
    if (startPosition) {
      this.setPlayerPosition(player, startPosition, params.positionOffset);
    }

    return player;
  }

  private static initSystems(
    engine: Engine,
    player: Player,
    destinationName: string,
    exitName?: string
  ) {
    PlayerInputSystem({ engine: engine, player: player });
    PlayerRespawnSystem({
      engine: engine,
      player: player,
      boundValue: 1000,
      destinationName: destinationName,
      previousSceneData: { exitName: exitName },
    });
    PlayerEventSystem({ engine: engine, player: player });
    PlayerDoubleJumpSystem({ player: player });
    PlayerPassthroughSystem({ player: player });
  }

  private static createPlayer(params: SetupParams): Player {
    return params.map.add<Player>(PlayerEntity(params.engine));
  }

  private static findStartPosition(
    params: SetupParams
  ): TiledObject | undefined {
    const positions = params.tiledMap.layers[5].objects as TiledObject[];
    return positions.find((position) =>
      this.isValidStartPosition(position, params)
    );
  }

  private static isValidStartPosition(
    position: TiledObject,
    params: SetupParams
  ): boolean {
    const { previousSceneData, playerStartNames, entranceExitMapping } = params;

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
  }

  private static setPlayerPosition(
    player: Player,
    position: TiledObject,
    offset?: { x: number; y: number }
  ): void {
    const offsetX = offset?.x ?? 0;
    const offsetY = offset?.y ?? 0;
    player.pos.x = position.x + offsetX;
    player.pos.y = position.y + offsetY;
  }
}
