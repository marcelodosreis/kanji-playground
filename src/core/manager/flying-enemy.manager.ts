import type { TiledObject } from "../../types/tiled-map.interface";
import { TAGS } from "../../types/tags.enum";
import type { Player } from "../../types/player.interface";
import {
  BaseEntityManager,
  type BaseManagerParams,
} from "./_/base-entity.manager";
import { TiledObjectHelper } from "../../helpers/tiled-object.helper";
import { EntityFactory } from "../../factories/entity-factory";
import { SystemInitializerHelper } from "../../helpers/system-initializer.helper";
import type { Enemy } from "../../types/enemy.interface";
import { getPlayer } from "../../utils/get-player";

export type FlyingEnemyManagerParams = BaseManagerParams;

export class FlyingEnemyManager extends BaseEntityManager<Enemy> {
  private constructor(params: FlyingEnemyManagerParams) {
    super(params);
  }

  public static setup(params: FlyingEnemyManagerParams): void {
    const manager = new FlyingEnemyManager(params);
    manager.setup();
  }

  public setup(): void {
    const positions = TiledObjectHelper.findByType(
      this.tiledMap,
      TAGS.FLY_ENEMY
    );
    this.spawnFromPositions(positions);
  }

  private spawnFromPositions(positions: TiledObject[]): void {
    const player = getPlayer({ engine: this.engine });
    if (!player) return;
    positions.forEach((pos) => this.spawnAtPosition(pos, player));
  }

  private spawnAtPosition(position: TiledObject, player: Player): void {
    const enemy = this.createEnemy(position);
    this.initializeEnemy(enemy, player);
  }

  private createEnemy(position: TiledObject): Enemy {
    return EntityFactory.createFlyingEnemy(
      this.engine,
      this.map,
      position.x,
      position.y
    );
  }

  private initializeEnemy(enemy: Enemy, player: Player): void {
    SystemInitializerHelper.initFlyingEnemySystems(this.engine, enemy, player);
  }
}
