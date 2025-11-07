import type { Engine } from "../../../types/engine.interface";
import type { Player } from "../../../types/player.interface";

type Params = {
  engine: Engine;
  player: Player;
  boundValue: number;
};

export function PlayerBoundarySystem({ engine, player, boundValue }: Params) {
  function checkOutOfBounds() {
    if (player.pos.y > boundValue) player.trigger("outOfBounds");
  }

  engine.onUpdate(checkOutOfBounds);
}
