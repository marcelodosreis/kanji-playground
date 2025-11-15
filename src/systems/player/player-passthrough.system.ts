import type { Collision } from "kaplay";
import type { Player } from "../../types/player.interface";
import type { PlayerSystemWithAPI } from "../../types/player-system.interface";
import { MAP_TAGS } from "../../types/tags.enum";

type Params = {
  player: Player;
};

type CollisionTarget = {
  is: (tag: string) => boolean;
};

type CollisionWithTarget = Collision & {
  target: CollisionTarget;
};

const shouldPreventResolution = (
  collision: CollisionWithTarget,
  player: Player
): boolean => {
  return collision.target.is(MAP_TAGS.PASSTHROUGH) && player.isJumping();
};

export function PlayerPassthroughSystem({
  player,
}: Params): PlayerSystemWithAPI<{}> {
  const handleBeforePhysicsResolve = (collision: Collision): void => {
    const typedCollision = collision as CollisionWithTarget;

    if (shouldPreventResolution(typedCollision, player)) {
      collision.preventResolution();
    }
  };

  player.onBeforePhysicsResolve(handleBeforePhysicsResolve);

  return {};
}
