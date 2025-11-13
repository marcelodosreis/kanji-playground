import type { Collision } from "kaplay";
import type { Player } from "../../types/player.interface";

type Params = {
  player: Player;
};

type CollisionTarget = {
  is: (tag: string) => boolean;
};

type CollisionWithTarget = Collision & {
  target: CollisionTarget;
};

const COLLISION_TAGS = {
  PASSTHROUGH: "passthrough",
};

const shouldPreventResolution = (
  collision: CollisionWithTarget,
  player: Player
): boolean => {
  return collision.target.is(COLLISION_TAGS.PASSTHROUGH) && player.isJumping();
};

export function PlayerPassthroughSystem({ player }: Params) {
  const handleBeforePhysicsResolve = (collision: Collision): void => {
    const typedCollision = collision as CollisionWithTarget;

    if (shouldPreventResolution(typedCollision, player)) {
      collision.preventResolution();
    }
  };

  player.onBeforePhysicsResolve(handleBeforePhysicsResolve);
}
