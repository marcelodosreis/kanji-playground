import type { Engine } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";

type Params = {
  engine: Engine;
  player: Player;
  boundValue: number;
  destinationName: string;
  previousSceneData: { exitName?: string };
};

export function PlayerRespawnSystem({
  engine,
  player,
  boundValue,
  destinationName,
  previousSceneData,
}: Params) {
  engine.onUpdate(() => {
    if (player.pos.y > boundValue) {
      engine.go(destinationName, previousSceneData);
    }
  });
}
