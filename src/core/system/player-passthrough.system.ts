import type { Collision } from "kaplay";
import type { Player } from "../../types/player.interface";

type Params = {
  player: Player;
};

export function PlayerPassthroughSystem({ player }: Params) {
  function handleBeforePhysicsResolve(collision: Collision) {
    if (isPassthroughCollision(collision) && player.isJumping()) {
      collision.preventResolution();
    }
  }

  function isPassthroughCollision(collision: any): boolean {
    return collision.target.is("passthrough");
  }

  player.onBeforePhysicsResolve(handleBeforePhysicsResolve);
}
