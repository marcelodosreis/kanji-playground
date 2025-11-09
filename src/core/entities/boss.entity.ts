import type { Vec2 } from "kaplay";
import { BURNER_ANIMATIONS } from "../../types/animations.enum";
import type { Boss } from "../../types/boss.interface";
import type { Engine } from "../../types/engine.type";
import { BOSS_EVENTS } from "../../types/events.enum";
import { EXTRA_TAGS, TAGS } from "../../types/tags.enum";
import { SPRITES } from "../../types/sprites.enum";

export function BossEntity(engine: Engine, initialPos: Vec2): Boss {
  return engine.make([
    TAGS.BOSS,
    EXTRA_TAGS.HITTABLE,
    engine.pos(initialPos),
    engine.sprite(SPRITES.BURNER, { anim: BURNER_ANIMATIONS.IDLE }),
    engine.area({ shape: new engine.Rect(engine.vec2(0, 8), 24, 16) }),
    engine.body({ mass: 100, jumpForce: 320 }),
    engine.anchor("center"),
    engine.state(BOSS_EVENTS.IDLE, [...Object.values(BOSS_EVENTS)]),
    engine.health(1),
    engine.opacity(1),
    {
      pursuitSpeed: 100,
      fireRange: 40,
      fireDuration: 1,
      isKnockedBack: false,
    },
  ]);
}
