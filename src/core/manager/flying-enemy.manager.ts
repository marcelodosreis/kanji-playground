import type { TiledObject } from "../../types/tiled-map.interface";
import { TAGS } from "../../types/tags.enum";
import type { Player } from "../../types/player.interface";
import {
  BaseEntityManager,
  type BaseManagerParams,
} from "../../types/entity-manager.abstract";
import { TiledObjectHelper } from "../../helpers/tiled-object.helper";
import { EntityFactory } from "../../factories/entity-factory";
import type { Enemy } from "../../types/enemy.interface";
import { getPlayer } from "../../utils/get-player";
import { createFlyingEnemyStateMachine } from "../system/enemies/flying-enemy/flying-enemy-state-machine";
import { SystemRegistryFactory } from "../../factories/system-registry-factory";

export type FlyingEnemyManagerParams = BaseManagerParams;

export class FlyingEnemyManager extends BaseEntityManager<Enemy[]> {
  private constructor(params: FlyingEnemyManagerParams) {
    super(params);
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
    return TiledObjectHelper.findByType(this.tiledMap, TAGS.FLY_ENEMY);
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
      position.y
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
      stateMachine,
    });
  }
}
