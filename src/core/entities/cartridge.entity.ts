import type { Engine } from "../../types/engine.interface";
import type { Position } from "../../types/position.interface";

export function CartridgeEntity(engine: Engine, pos: Position) {
  return engine.make([
    "cartridge",
    engine.sprite("cartridge", { anim: "default" }),
    engine.area(),
    engine.anchor("center"),
    engine.pos(pos),
  ]);
}
