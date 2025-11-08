import { FlyingEnemyEntity } from "../entities/flying-enemy.entity";
import type { Engine } from "../../types/engine.interface";
import type { Map } from "../../types/map.interface";
import type { TiledMap, TiledObject } from "../../types/tiled-map.interface";
import type { Enemy } from "../../types/enemy.interface";
import { TAGS } from "../../types/tags.enum";
import type { Player } from "../../types/player.interface";
import { createFlyingEnemyStateMachine } from "../system/enemies/flying-enemy/flying-enemy-state-machine";
import { FlyingEnemyPatrolSystem } from "../system/enemies/flying-enemy/flying-enemy-patrol.system";
import { FlyingEnemyAttackSystem } from "../system/enemies/flying-enemy/flying-enemy-attack.system";
import { FlyingEnemyCollisionSystem } from "../system/enemies/flying-enemy/flying-enemy-collision.system";
import { FlyingEnemyAnimationSystem } from "../system/enemies/flying-enemy/flying-enemy-animation.system";
import { FlyingEnemyReturnSystem } from "../system/enemies/flying-enemy/flying-enemy-return.system";
import { FlyingEnemyAlertSystem } from "../system/enemies/flying-enemy/flying-enemy-alert.system";
import { MapLayer, MapLayerHelper } from "../../utils/map-layer-helper";

type FlyingEnemyManagerParams = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
};

export class FlyingEnemyManager {
  private readonly engine: Engine;
  private readonly map: Map;
  private readonly tiledMap: TiledMap;

  private constructor(params: FlyingEnemyManagerParams) {
    this.engine = params.engine;
    this.map = params.map;
    this.tiledMap = params.tiledMap;
  }

  public static setup(params: FlyingEnemyManagerParams): void {
    const manager = new FlyingEnemyManager(params);
    manager.setupInstance();
  }

  private setupInstance(): void {
    const positions = this.getSpawnPositions();
    this.spawnEnemies(positions);
  }

  private getSpawnPositions(): TiledObject[] {
    return MapLayerHelper.getObjects(this.tiledMap, MapLayer.PIN);
  }

  private spawnEnemies(positions: TiledObject[]): void {
    positions
      .filter((pos) => this.isValidSpawnPosition(pos))
      .forEach((pos) => this.createEnemy(pos));
  }

  private isValidSpawnPosition(position: TiledObject): boolean {
    return position.type === TAGS.FLY_ENEMY;
  }

  private createEnemy(position: TiledObject): void {
    const spawnPosition = this.engine.vec2(position.x, position.y);
    const enemy = this.map.add<Enemy>(
      FlyingEnemyEntity(this.engine, spawnPosition)
    );
    this.initializeSystems(enemy);
  }

  private initializeSystems(enemy: Enemy): void {
    const [player] = this.engine.get(TAGS.PLAYER, {
      recursive: true,
    }) as Player[];

    const stateMachine = createFlyingEnemyStateMachine({
      engine: this.engine,
      enemy,
      player,
    });

    FlyingEnemyPatrolSystem({
      engine: this.engine,
      enemy,
      player,
      stateMachine,
    });
    FlyingEnemyAlertSystem({
      engine: this.engine,
      enemy,
      player,
      stateMachine,
    });
    FlyingEnemyAttackSystem({
      engine: this.engine,
      enemy,
      player,
      stateMachine,
    });
    FlyingEnemyReturnSystem({
      engine: this.engine,
      enemy,
      player,
      stateMachine,
    });
    FlyingEnemyCollisionSystem({ engine: this.engine, enemy, player });
    FlyingEnemyAnimationSystem({ engine: this.engine, enemy });
  }
}
