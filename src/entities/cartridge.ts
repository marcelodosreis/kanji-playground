import { state } from "../core/state.js";
import type { Engine } from "../types/engine.js";
import type { Position } from "../types/position.js";

export function createCartridge(engine: Engine, pos: Position) {
  const cartridge = engine.make([
    engine.sprite("cartridge", { anim: "default" }),
    engine.area(),
    engine.anchor("center"),
    engine.pos(pos),
  ]);

  cartridge.onCollide("player", (player) => {
    // engine.play("health", { volume: 0.5 });
    if (player.hp() < state.current().maxPlayerHp) {
      player.heal(1);
    }
    engine.destroy(cartridge);
  });

  return cartridge;
}
