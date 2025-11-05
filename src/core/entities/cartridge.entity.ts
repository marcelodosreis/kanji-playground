import { SPRITES } from "../../types/animations.enum";
import type { Engine } from "../../types/engine.interface";
import type { Position } from "../../types/position.interface";
import { TAGS } from "../../types/tags.enum";

export function CartridgeEntity(engine: Engine, pos: Position) {
  return engine.make([
    TAGS.CARTRIDGE,
    engine.sprite(SPRITES.CARTRIDGE, { anim: "default" }),
    engine.area(),
    engine.anchor("center"),
    engine.pos(pos),
  ]);
}
