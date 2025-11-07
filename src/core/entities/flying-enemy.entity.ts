import { BAT_ANIMATIONS, SPRITES } from "../../types/animations.enum";
import type { Enemy } from "../../types/enemy.interface";
import type { Engine } from "../../types/engine.interface";
import { FLYING_ENEMY_EVENTS } from "../../types/events.enum";
import type { Position } from "../../types/position.interface";
import { TAGS } from "../../types/tags.enum";

export function FlyingEnemyEntity(engine: Engine, initialPos: Position): Enemy {
  return engine.make([
    TAGS.FLY_ENEMY,
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
      initialPos,
      isKnockedBack: false,
    },
  ]);
}
