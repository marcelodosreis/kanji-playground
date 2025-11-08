import type { Vec2 } from "kaplay";
import { BAT_ANIMATIONS, SPRITES } from "../../types/animations.enum";
import type { Enemy } from "../../types/enemy.interface";
import type { Engine } from "../../types/engine.type";
import { FLYING_ENEMY_EVENTS } from "../../types/events.enum";
import { EXTRA_TAGS, TAGS } from "../../types/tags.enum";

export function FlyingEnemyEntity(engine: Engine, initialPos: Vec2): Enemy {
  return engine.make([
    TAGS.FLY_ENEMY,
    EXTRA_TAGS.HITTABLE,
    engine.pos(initialPos),
    engine.sprite(SPRITES.BAT, { anim: BAT_ANIMATIONS.FLYING }),
    engine.area({ shape: new engine.Rect(engine.vec2(0, 0), 6, 6) }),
    engine.anchor("center"),
    engine.body({ gravityScale: 0 }),
    engine.offscreen({ distance: 400 }),
    engine.state(FLYING_ENEMY_EVENTS.PATROL_RIGHT, [
      ...Object.values(FLYING_ENEMY_EVENTS),
    ]),
    engine.health(3),
    {
      speed: 90,
      pursuitSpeed: 130,
      range: 90,
      maxPursuitDistance: 300,
      initialPos: engine.vec2(initialPos.x, initialPos.y),
      isKnockedBack: false,
    },
  ]);
}
