import type { Engine } from "../types/engine.type";
import type { Map } from "../types/map.interface";
import type { Player } from "../types/player.interface";
import type { Enemy } from "../types/enemy.interface";
import { PlayerEntity } from "../core/entities/player.entity";
import { FlyingEnemyEntity } from "../core/entities/flying-enemy.entity";


export class EntityFactory {
  static createPlayer(engine: Engine, map: Map): Player {
    return map.add<Player>(PlayerEntity(engine));
  }

  static createFlyingEnemy(engine: Engine, map: Map, x: number, y: number): Enemy {
    const pos = engine.vec2(x, y);
    return map.add<Enemy>(FlyingEnemyEntity(engine, pos));
  }
}