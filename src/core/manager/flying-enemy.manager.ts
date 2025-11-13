import type { TiledObject } from "../../types/tiled-map.interface";
import { TAGS } from "../../types/tags.enum";
import type { Player } from "../../types/player.interface";
import {
  BaseEntityManager,
  type BaseManagerParams,
} from "../../types/entity-manager.abstract";
import { EntityFactory } from "../../factories/entity-factory";
import type { Enemy } from "../../types/enemy.interface";
import { getPlayer } from "../../utils/get-player";
import { createFlyingEnemyStateMachine } from "../system/enemies/flying-enemy/fly-enemy-state-machine-system";
import { SystemRegistryFactory } from "../../factories/system-registry-factory";
import { MapLayer, MapLayerHelper } from "../../helpers/map-layer-helper";
import type { FLYING_ENEMY_SPRITES } from "../../types/sprites.enum";
import type { CollidersEngineGameObj } from "../../types/engine.type";

export type FlyingEnemyManagerParams = BaseManagerParams & {
  colliders: CollidersEngineGameObj[];
};

export class FlyingEnemyManager extends BaseEntityManager<Enemy[]> {
  private colliders: CollidersEngineGameObj[];
  private constructor(params: FlyingEnemyManagerParams) {
    super(params);
    this.colliders = params.colliders;
  }

  public static setup(params: FlyingEnemyManagerParams): Enemy[] {
    const manager = new FlyingEnemyManager(params);
    return manager.setup();
  }

  public setup(): Enemy[] {
    const positions = this.resolveSpawnPositions();
    return this.spawnEntities(positions);
  }

  private resolveSpawnPositions(): TiledObject[] {
    return MapLayerHelper.getObjects(this.tiledMap, MapLayer.PIN).filter(
      (obj) => obj.type === TAGS.FLY_ENEMY
    );
  }

  private spawnEntities(positions: TiledObject[]): Enemy[] {
    const player = getPlayer({ engine: this.engine });
    if (!player) return [];

    return positions.map((pos) => {
      const enemy = this.createEntity(pos);
      this.initializeSystems(enemy, player);
      return enemy;
    });
  }

  private createEntity(position: TiledObject): Enemy {
    return EntityFactory.createFlyingEnemy(
      this.engine,
      this.map,
      position.x,
      position.y,
      position.name as FLYING_ENEMY_SPRITES
    );
  }

  private initializeSystems(enemy: Enemy, player: Player): void {
    const stateMachine = createFlyingEnemyStateMachine({
      engine: this.engine,
      enemy,
      player,
    });
    SystemRegistryFactory.registerFlyingEnemySystems({
      engine: this.engine,
      enemy,
      player,
      colliders: this.colliders,
      stateMachine,
    });
  }
}
