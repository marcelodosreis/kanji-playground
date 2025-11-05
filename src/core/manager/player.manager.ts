import type { Engine, EngineGameObj } from "../../types/engine.interface";
import type { Map } from "../../types/map.interface";
import type { Player } from "../../types/player.interface";
import type { TiledMap, TiledObject } from "../../types/tiled-map.interface";
import { PlayerEntity } from "../entities/player.entity";
import { PlayerAttackSystem } from "../system/player-attack.system";
import { PlayerDoubleJumpSystem } from "../system/player-double-jump.system";
import { PlayerEventSystem } from "../system/player-event.system";
import { PlayerIdleSystem } from "../system/player-idle.system";
import { PlayerJumpSystem } from "../system/player-jump.system";
import { PlayerPassthroughSystem } from "../system/player-passthrough.system";
import { PlayerRespawnSystem } from "../system/player-respawn.system";
import { PlayerWalkSystem } from "../system/player-walk.system";

type PositionOffset = {
  x: number;
  y: number;
};

type RespawnConfig = {
  bounds: number;
  roomName: string;
  exitName?: string;
};

type PlayerManagerParams = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
  previousSceneData: EngineGameObj;
  playerStartNames: string[];
  entranceExitMapping: Record<string, string>;
  positionOffset?: PositionOffset;
  respawnConfig: RespawnConfig;
};

const PLAYER_LAYER_INDEX = 5;

export class PlayerManager {
  private readonly engine: Engine;
  private readonly map: Map;
  private readonly tiledMap: TiledMap;
  private readonly previousSceneData: EngineGameObj;
  private readonly playerStartNames: string[];
  private readonly entranceExitMapping: Record<string, string>;
  private readonly positionOffset?: PositionOffset;
  private readonly respawnConfig: RespawnConfig;

  private constructor(params: PlayerManagerParams) {
    this.engine = params.engine;
    this.map = params.map;
    this.tiledMap = params.tiledMap;
    this.previousSceneData = params.previousSceneData;
    this.playerStartNames = params.playerStartNames;
    this.entranceExitMapping = params.entranceExitMapping;
    this.positionOffset = params.positionOffset;
    this.respawnConfig = params.respawnConfig;
  }

  public static setup(params: PlayerManagerParams): Player {
    const manager = new PlayerManager(params);
    return manager.setupInstance();
  }

  private setupInstance(): Player {
    const player = this.createPlayer();
    const startPosition = this.findStartPosition();

    this.initializeSystems(player);

    if (startPosition) {
      this.positionPlayer(player, startPosition);
    }

    return player;
  }

  private createPlayer(): Player {
    return this.map.add<Player>(PlayerEntity(this.engine));
  }

  private findStartPosition(): TiledObject | undefined {
    const positions = this.getPlayerPositions();
    return positions.find((pos) => this.isValidStartPosition(pos));
  }

  private getPlayerPositions(): TiledObject[] {
    const layer = this.tiledMap.layers[PLAYER_LAYER_INDEX];
    if (!layer || !layer.objects) {
      return [];
    }
    return layer.objects as TiledObject[];
  }

  private isValidStartPosition(position: TiledObject): boolean {
    return (
      this.isDefaultStartPosition(position) ||
      this.isEntranceExitMatchPosition(position)
    );
  }

  private isDefaultStartPosition(position: TiledObject): boolean {
    return (
      position.name === "player" &&
      !this.previousSceneData.exitName &&
      this.playerStartNames.includes("player")
    );
  }

  private isEntranceExitMatchPosition(position: TiledObject): boolean {
    return (
      this.playerStartNames.includes(position.name) &&
      this.entranceExitMapping[position.name] ===
        this.previousSceneData.exitName
    );
  }

  private positionPlayer(player: Player, position: TiledObject): void {
    const offsetX = this.positionOffset?.x ?? 0;
    const offsetY = this.positionOffset?.y ?? 0;
    player.pos.x = position.x + offsetX;
    player.pos.y = position.y + offsetY;
  }

  private initializeSystems(player: Player): void {
    PlayerJumpSystem({ engine: this.engine, player });
    PlayerWalkSystem({ engine: this.engine, player });
    PlayerIdleSystem({ engine: this.engine, player });

    PlayerAttackSystem({ engine: this.engine, player });
    PlayerRespawnSystem({
      engine: this.engine,
      player,
      boundValue: this.respawnConfig.bounds,
      destinationName: this.respawnConfig.roomName,
      previousSceneData: { exitName: this.respawnConfig.exitName },
    });
    PlayerEventSystem({ engine: this.engine, player });
    PlayerDoubleJumpSystem({ player });
    PlayerPassthroughSystem({ player });
  }
}
