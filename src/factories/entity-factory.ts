import type { Engine } from "../types/engine.type";
import type { Map } from "../types/map.interface";
import type { Player } from "../types/player.interface";
import type { Enemy } from "../types/enemy.interface";
import type { Boss } from "../types/boss.interface";
import { PlayerEntity } from "../entities/player.entity";
import { FlyingEnemyEntity } from "../entities/flying-enemy.entity";
import { BossEntity } from "../entities/boss.entity";
import { FLYING_ENEMY_SPRITES } from "../types/sprites.enum";

export class EntityFactory {
  static createPlayer(engine: Engine, map: Map): Player {
    return map.add<Player>(PlayerEntity(engine));
  }

  static createFlyingEnemy(
    engine: Engine,
    map: Map,
    x: number,
    y: number,
    sprite: FLYING_ENEMY_SPRITES
  ): Enemy {
    const pos = engine.vec2(x, y);
    return map.add<Enemy>(FlyingEnemyEntity(engine, pos, sprite));
  }

  static createBoss(engine: Engine, map: Map, x: number, y: number): Boss {
    const pos = engine.vec2(x, y);
    return map.add<Boss>(BossEntity(engine, pos));
  }
}
