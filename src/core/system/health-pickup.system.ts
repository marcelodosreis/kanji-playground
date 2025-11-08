import { GLOBAL_STATE_CONTROLLER } from "../global-state-controller";
import type { Engine, EngineGameObj } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";
import { TAGS } from "../../types/tags.enum";

type Params = {
  engine: Engine;
  healthPickup: EngineGameObj;
};

export function HealthPickupSystem({ engine, healthPickup }: Params) {
  function onPlayerCollision(player: Player) {
    if (player.hp() < GLOBAL_STATE_CONTROLLER.current().maxPlayerHp) {
      player.heal(1);
    }
    engine.destroy(healthPickup);
  }

  healthPickup.onCollide(TAGS.PLAYER, onPlayerCollision);
}
