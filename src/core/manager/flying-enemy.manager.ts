import { FlyingEnemyEntity } from "../entities/flying-enemy.entity";
import type { Engine } from "../../types/engine.interface";
import type { Map } from "../../types/map.interface";
import type { TiledMap, TiledObject } from "../../types/tiled-map.interface";
import type { Enemy } from "../../types/enemy.interface";
import { TAGS } from "../../types/tags.enum";
import { FlyingEnemySystem } from "../system/ai-flying-enemy.system";


type FlyingEnemyManagerParams = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
};

const ENEMY_LAYER_INDEX = 5;

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
    const layer = this.tiledMap.layers[ENEMY_LAYER_INDEX];
    if (!layer || !layer.objects) {
      return [];
    }
    return layer.objects as TiledObject[];
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
    FlyingEnemySystem({ engine: this.engine, enemy });
  }
}