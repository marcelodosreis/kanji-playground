import { state } from "../state";
import type { Engine, EngineGameObj } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";

export function CartridgeCollisionSystem(
  engine: Engine,
  cartridge: EngineGameObj
) {
  cartridge.onCollide("player", (player: Player) => {
    // engine.play("health", { volume: 0.5 });
    if (player.hp() < state.current().maxPlayerHp) {
      player.heal(1);
    }
    engine.destroy(cartridge);
  });
}
