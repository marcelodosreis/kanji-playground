import { EntityFactory } from "../../factories/entity-factory";

import type { Player } from "../../types/player.interface";
import type { TiledObject } from "../../types/tiled-map.interface";
import { SystemInitializerHelper } from "../../helpers/system-initializer.helper";
import { PlayerPositionResolver } from "../../helpers/player-position-resolver.helper";
import {
  BaseEntityManager,
  type BaseManagerParams,
} from "./_/base-entity.manager";
import type { EngineGameObj } from "../../types/engine.type";

type PositionOffset = { x: number; y: number };
type RespawnConfig = { bounds: number; roomName: string; exitName?: string };

export type PlayerManagerParams = BaseManagerParams & {
  previousSceneData: EngineGameObj;
  playerStartNames: string[];
  entranceExitMapping: Record<string, string>;
  positionOffset?: PositionOffset;
  respawnConfig: RespawnConfig;
};

export class PlayerManager extends BaseEntityManager<Player> {
  private readonly previousSceneData: EngineGameObj;
  private readonly playerStartNames: string[];
  private readonly entranceExitMapping: Record<string, string>;
  private readonly positionOffset: PositionOffset;
  private readonly respawnConfig: RespawnConfig;

  private constructor(params: PlayerManagerParams) {
    super(params);
    this.previousSceneData = params.previousSceneData;
    this.playerStartNames = params.playerStartNames;
    this.entranceExitMapping = params.entranceExitMapping;
    this.positionOffset = params.positionOffset ?? { x: 0, y: 0 };
    this.respawnConfig = params.respawnConfig;
  }

  public static setup(params: PlayerManagerParams): Player {
    const manager = new PlayerManager(params);
    return manager.setup();
  }

  public setup(): Player {
    const player = this.createPlayer();
    this.initializePlayerSystems(player);
    const startPosition = PlayerPositionResolver.resolveStart(
      this.tiledMap,
      this.previousSceneData,
      this.playerStartNames,
      this.entranceExitMapping
    );
    if (startPosition) {
      this.positionPlayer(player, startPosition);
    }
    return player;
  }

  private createPlayer(): Player {
    return EntityFactory.createPlayer(this.engine, this.map);
  }

  private initializePlayerSystems(player: Player): void {
    SystemInitializerHelper.initPlayerSystems(this.engine, player, {
      boundValue: this.respawnConfig.bounds,
      destinationName: this.respawnConfig.roomName,
      previousSceneData: { exitName: this.respawnConfig.exitName },
    });
  }

  private positionPlayer(player: Player, position: TiledObject): void {
    player.pos.x = position.x + this.positionOffset.x;
    player.pos.y = position.y + this.positionOffset.y;
  }
}
