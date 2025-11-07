import type { Engine, EngineGameObj } from "../../types/engine.interface";
import type { Map } from "../../types/map.interface";
import type { Player } from "../../types/player.interface";
import { TAGS } from "../../types/tags.enum";
import type { TiledMap, TiledObject } from "../../types/tiled-map.interface";
import { PlayerEntity } from "../entities/player.entity";
import { PlayerAnimationSystem } from "../system/player-animation.system";
import { PlayerAttackSystem } from "../system/player-attack.system";
import { PlayerHealthSystem } from "../system/player-health.system";
import { PlayerJumpSystem } from "../system/player-jump.system";
import { PlayerPassthroughSystem } from "../system/player-passthrough.system";
import { PlayerBoundarySystem } from "../system/player-boundary.system";
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
      position.name === TAGS.PLAYER &&
      !this.previousSceneData.exitName &&
      this.playerStartNames.includes(TAGS.PLAYER)
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

    PlayerAttackSystem({ engine: this.engine, player });
    PlayerBoundarySystem({
      engine: this.engine,
      player,
      boundValue: this.respawnConfig.bounds,
    });
    PlayerHealthSystem({
      engine: this.engine,
      player,
      destinationName: this.respawnConfig.roomName,
      previousSceneData: { exitName: this.respawnConfig.exitName },
    });
    PlayerAnimationSystem({ engine: this.engine, player });
    PlayerPassthroughSystem({ player });
  }
}
