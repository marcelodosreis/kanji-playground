import type { Vec2 } from "kaplay";
import { FLYING_ANIMATIONS } from "../../types/animations.enum";
import type { Enemy } from "../../types/enemy.interface";
import type { Engine } from "../../types/engine.type";
import { FLYING_ENEMY_EVENTS } from "../../types/events.enum";
import { EXTRA_TAGS, TAGS } from "../../types/tags.enum";
import type { FLYING_ENEMY_SPRITES } from "../../types/sprites.enum";

export function FlyingEnemyEntity(
  engine: Engine,
  initialPos: Vec2,
  sprite: FLYING_ENEMY_SPRITES
): Enemy {
  return engine.make([
    TAGS.FLY_ENEMY,
    EXTRA_TAGS.HITTABLE,
    engine.pos(initialPos),
    engine.sprite(sprite, { anim: FLYING_ANIMATIONS.FLYING }),
    engine.area({
      shape: new engine.Rect(engine.vec2(0, 0), 6, 6),
      collisionIgnore: [TAGS.FLY_ENEMY],
    }),
    engine.anchor("center"),
    engine.body({ gravityScale: 0 }),
    engine.offscreen({ distance: 400 }),
    engine.state(FLYING_ENEMY_EVENTS.PATROL_RIGHT, [
      ...Object.values(FLYING_ENEMY_EVENTS),
    ]),
    engine.health(3),
    {
      speed: 90,
      range: 90,
      patrolDistance: 100,
      pursuitSpeed: 130,
      maxPursuitDistance: 110,
      initialPos: engine.vec2(initialPos.x, initialPos.y),
      isKnockedBack: false,
      behavior: sprite,
    },
  ]);
}
