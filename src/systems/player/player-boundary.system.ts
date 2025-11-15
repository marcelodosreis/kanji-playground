import type { Engine } from "../../types/engine.type";
import type { Player } from "../../types/player.interface";
import type { PlayerSystemWithAPI } from "../../types/player-system.interface";

type Params = {
  engine: Engine;
  player: Player;
  boundValue: number;
};

const isOutOfBounds = (currentY: number, boundValue: number): boolean => {
  return currentY > boundValue;
};

const triggerOutOfBoundsEvent = (player: Player): void => {
  player.trigger("outOfBounds");
};

export function PlayerBoundarySystem({
  engine,
  player,
  boundValue,
}: Params): PlayerSystemWithAPI<{}> {
  const checkOutOfBounds = (): void => {
    if (isOutOfBounds(player.pos.y, boundValue)) {
      player.hurt(1);
      triggerOutOfBoundsEvent(player);
    }
  };

  const update = (): void => {
    checkOutOfBounds();
  };

  engine.onUpdate(update);

  return {
    update,
  };
}
