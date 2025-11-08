import type { TiledObject } from "../../types/tiled-map.interface";
import { TAGS } from "../../types/tags.enum";
import type { Player } from "../../types/player.interface";
import {
  BaseEntityManager,
  type BaseManagerParams,
} from "./base-entity.manager";
import { TiledObjectHelper } from "../../helpers/tiled-object.helper";
import { EntityFactory } from "../../factories/entity-factory";
import type { Enemy } from "../../types/enemy.interface";
import { getPlayer } from "../../utils/get-player";
import { createFlyingEnemyStateMachine } from "../system/enemies/flying-enemy/flying-enemy-state-machine";
import { SystemRegistry } from "../../factories/system-registry";

export type FlyingEnemyManagerParams = BaseManagerParams;

export class FlyingEnemyManager extends BaseEntityManager<void> {
  private constructor(params: FlyingEnemyManagerParams) {
    super(params);
  }

  public static setup(params: FlyingEnemyManagerParams): void {
    const manager = new FlyingEnemyManager(params);
    manager.setup();
  }

  public setup(): void {
    const positions = this.resolveSpawnPositions();
    this.spawnEntities(positions);
  }

  private resolveSpawnPositions(): TiledObject[] {
    return TiledObjectHelper.findByType(this.tiledMap, TAGS.FLY_ENEMY);
  }

  private spawnEntities(positions: TiledObject[]): void {
    const player = getPlayer({ engine: this.engine });
    if (!player) return;
    positions.forEach((pos) => {
      const enemy = this.createEntity(pos);
      this.initializeSystems(enemy, player);
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
    SystemRegistry.registerFlyingEnemySystems({
      engine: this.engine,
      enemy,
      player,
      stateMachine,
    });
  }
}
