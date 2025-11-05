import type { Player } from "../../types/player.interface";
import { state } from "../state";

type Params = {
  player: Player;
};
export function PlayerDoubleJumpSystem(params: Params) {
  params.player.numJumps = state.current().isDoubleJumpUnlocked ? 2 : 1;
  state.subscribe("isDoubleJumpUnlocked", (unlocked: boolean) => {
    params.player.numJumps = unlocked ? 2 : 1;
  });
}
