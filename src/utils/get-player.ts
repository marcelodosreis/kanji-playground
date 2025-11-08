import type { Engine } from "../types/engine.type";
import type { Player } from "../types/player.interface";
import { TAGS } from "../types/tags.enum";

export function getPlayer({
  engine,
}: {
  engine: Engine;
}): Player | undefined {
  const [player] = engine.get(TAGS.PLAYER, {
    recursive: true,
  }) as Player[];
  return player;
}
