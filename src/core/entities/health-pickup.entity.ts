import type { Vec2 } from "kaplay";
import { SPRITES } from "../../types/animations.enum";
import type { Engine, EngineGameObj } from "../../types/engine.type";
import { TAGS } from "../../types/tags.enum";

export function HealthPickupEntity(engine: Engine, pos: Vec2): EngineGameObj {
  return engine.make([
    TAGS.HEALTH_PICKUP,
    engine.sprite(SPRITES.CARTRIDGE, { anim: "default" }),
    engine.area(),
    engine.anchor("center"),
    engine.pos(pos),
  ]);
}
