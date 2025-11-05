import { state } from "../state";
import type { Engine, EngineGameObj } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";

type Params = {
  engine: Engine;
  cartridge: EngineGameObj;
};

export function CartridgeCollisionSystem({ engine, cartridge }: Params) {
  function onPlayerCollision(player: Player) {
    if (player.hp() < state.current().maxPlayerHp) {
      player.heal(1);
    }
    engine.destroy(cartridge);
  }

  cartridge.onCollide("player", onPlayerCollision);
}
