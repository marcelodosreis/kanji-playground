import type { Engine, EngineGameObj } from "../../types/engine.interface";
import type { Map } from "../../types/map.interface";
import type { Player } from "../../types/player.interface";
import type { TiledMap, TiledObject } from "../../types/tiled-map.interface";
import { PlayerEntity } from "../entities/player.entity";
import { PlayerAttackSystem } from "../system/player-attack.system";
import { PlayerDoubleJumpSystem } from "../system/player-double-jump.system";
import { PlayerEventSystem } from "../system/player-event.system";
import { PlayerMovementSystem } from "../system/player-movement.system";
import { PlayerPassthroughSystem } from "../system/player-passthrough.system";
import { PlayerRespawnSystem } from "../system/player-respawn.system";

type RespawnConfig = {
  bounds: number;
  roomName: string;
  exitName?: string;
};

type PositionOffset = {
  x: number;
  y: number;
};

type SetupParams = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
  previousSceneData: EngineGameObj;
  playerStartNames: string[];
  entranceExitMapping: Record<string, string>;
  positionOffset?: PositionOffset;
  respawnConfig: RespawnConfig;
};

export class PlayerManager {
  public static setup(params: SetupParams): Player {
    const { engine, respawnConfig, positionOffset } = params;
    const player = this.createPlayer(params);
    const startPosition = this.findStartPosition(params);

    this.initSystems(
      engine,
      player,
      respawnConfig.roomName,
      respawnConfig.exitName
    );

    if (startPosition) {
      this.setPlayerPosition(player, startPosition, positionOffset);
    }

    return player;
  }

  private static initSystems(
    engine: Engine,
    player: Player,
    destinationName: string,
    exitName?: string
  ): void {
    PlayerMovementSystem({ engine, player });
    PlayerAttackSystem({ engine, player });
    PlayerRespawnSystem({
      engine,
      player,
      boundValue: 1000,
      destinationName,
      previousSceneData: { exitName },
    });
    PlayerEventSystem({ engine, player });
    PlayerDoubleJumpSystem({ player });
    PlayerPassthroughSystem({ player });
  }

  private static createPlayer({ map, engine }: SetupParams): Player {
    return map.add<Player>(PlayerEntity(engine));
  }

  private static findStartPosition({
    tiledMap,
    previousSceneData,
    playerStartNames,
    entranceExitMapping,
  }: SetupParams): TiledObject | undefined {
    const positions = tiledMap.layers[5].objects as TiledObject[];
    return positions.find((position) =>
      this.isValidStartPosition(
        position,
        previousSceneData,
        playerStartNames,
        entranceExitMapping
      )
    );
  }

  private static isValidStartPosition(
    position: TiledObject,
    previousSceneData: EngineGameObj,
    playerStartNames: string[],
    entranceExitMapping: Record<string, string>
  ): boolean {
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
    offset?: PositionOffset
  ): void {
    const offsetX = offset?.x ?? 0;
    const offsetY = offset?.y ?? 0;
    player.pos.x = position.x + offsetX;
    player.pos.y = position.y + offsetY;
  }
}
