import { EntityFactory } from "../../factories/entity-factory";
import type { Player } from "../../types/player.interface";
import type { TiledObject } from "../../types/tiled-map.interface";
import { PlayerPositionResolver } from "../../helpers/player-position-resolver.helper";
import {
  BaseEntityManager,
  type BaseManagerParams,
} from "./base-entity.manager";
import type { EngineGameObj } from "../../types/engine.type";
import { createPlayerStateMachine } from "../system/player/player-state-machine";
import { SystemRegistryFactory } from "../../factories/system-registry-factory";

type PositionOffset = { x: number; y: number };
type RespawnConfig = { bounds: number; roomName: string; exitName?: string };

export type PlayerManagerParams = BaseManagerParams & {
  previousSceneData: EngineGameObj;
  playerStartNames: string[];
  entranceExitMapping: Record<string, string>;
  positionOffset?: PositionOffset;
  respawnConfig: RespawnConfig;
  initialCameraPos: { x: number; y: number };
};

export class PlayerManager extends BaseEntityManager<Player> {
  private readonly previousSceneData: EngineGameObj;
  private readonly playerStartNames: string[];
  private readonly entranceExitMapping: Record<string, string>;
  private readonly positionOffset: PositionOffset;
  private readonly respawnConfig: RespawnConfig;
  private readonly initialCameraPos: { x: number; y: number };

  private constructor(params: PlayerManagerParams) {
    super(params);
    this.previousSceneData = params.previousSceneData;
    this.playerStartNames = params.playerStartNames;
    this.entranceExitMapping = params.entranceExitMapping;
    this.positionOffset = params.positionOffset ?? { x: 0, y: 0 };
    this.respawnConfig = params.respawnConfig;
    this.initialCameraPos = params.initialCameraPos;
  }

  public static setup(params: PlayerManagerParams): Player {
    const manager = new PlayerManager(params);
    return manager.setup();
  }

  public setup(): Player {
    const player = this.createEntity();
    const positions = this.resolveSpawnPositions();
    const startPosition = positions[0];
    if (startPosition) this.applyPosition(player, startPosition);
    this.initializeSystems(player);
    return player;
  }

  private createEntity(): Player {
    return EntityFactory.createPlayer(this.engine, this.map);
  }

  private initializeSystems(player: Player): void {
    const stateMachine = createPlayerStateMachine({ player });
    SystemRegistryFactory.registerPlayerSystems({
      engine: this.engine,
      player,
      stateMachine,
      boundValue: this.respawnConfig.bounds,
      destinationName: this.respawnConfig.roomName,
      previousSceneData: { exitName: this.respawnConfig.exitName },
      map: this.map,
      tiledMap: this.tiledMap,
      initialCameraPos: this.initialCameraPos,
      previousSceneExitName: this.previousSceneData?.exitName,
    });
  }

  private resolveSpawnPositions(): TiledObject[] {
    const position = PlayerPositionResolver.resolveStart(
      this.tiledMap,
      this.previousSceneData,
      this.playerStartNames,
      this.entranceExitMapping
    );
    return position ? [position] : [];
  }

  private applyPosition(player: Player, position: TiledObject): void {
    player.pos.x = position.x + this.positionOffset.x;
    player.pos.y = position.y + this.positionOffset.y;
  }
}
