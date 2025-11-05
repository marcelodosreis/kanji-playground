import { DRONE_ANIMATIONS, SPRITES } from "../../types/animations.enum";
import type { Enemy } from "../../types/enemy.interface";
import type { Engine } from "../../types/engine.interface";
import { DRONE_EVENTS } from "../../types/events.enum";
import type { Position } from "../../types/position.interface";
import { TAGS } from "../../types/tags.enum";

export function DroneEntity(engine: Engine, initialPos: Position): Enemy {
  return engine.make([
    TAGS.DRONE,
    engine.pos(initialPos),
    engine.sprite(SPRITES.DRONE, { anim: DRONE_ANIMATIONS.FLYING }),
    engine.area({ shape: new engine.Rect(engine.vec2(0), 12, 12) }),
    engine.anchor("center"),
    engine.body({ gravityScale: 0 }),
    engine.offscreen({ distance: 400 }),
    engine.state(DRONE_EVENTS.PATROL_RIGHT, [...Object.values(DRONE_EVENTS)]),
    engine.health(1),
    {
      speed: 100,
      pursuitSpeed: 150,
      range: 100,
      initialPos,
    },
  ]);
}
