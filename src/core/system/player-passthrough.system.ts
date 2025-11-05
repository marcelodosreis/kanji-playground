import type { Player } from "../../types/player.interface";

export function PlayerPassthroughSystem(params: { player: Player }) {
  params.player.onBeforePhysicsResolve((collision) => {
    if (collision.target.is("passthrough") && params.player.isJumping()) {
      collision.preventResolution();
    }
  });
}
