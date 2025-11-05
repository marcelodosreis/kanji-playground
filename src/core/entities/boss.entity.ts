import { SPRITES, BURNER_ANIMATIONS } from "../../types/animations.enum";
import type { Boss } from "../../types/boss.interface";
import type { Engine } from "../../types/engine.interface";
import { BOSS_EVENTS } from "../../types/events.enum";
import type { Position } from "../../types/position.interface";
import { TAGS } from "../../types/tags.enum";

export function BossEntity(engine: Engine, initialPos: Position): Boss {
  return engine.make([
    TAGS.BOSS,
    engine.pos(initialPos),
    engine.sprite(SPRITES.BURNER, { anim: BURNER_ANIMATIONS.IDLE }),
    engine.area({ shape: new engine.Rect(engine.vec2(0, 10), 12, 12) }),
    engine.body({ mass: 100, jumpForce: 320 }),
    engine.anchor("center"),
    engine.state(BOSS_EVENTS.IDLE, [...Object.values(BOSS_EVENTS)]),
    engine.health(1),
    engine.opacity(1),
    {
      pursuitSpeed: 100,
      fireRange: 40,
      fireDuration: 1,
    },
  ]);
}
