import type { Player } from "../../types/player.interface";
import { state } from "../state";

type Params = {
  player: Player;
};

export function PlayerDoubleJumpSystem({ player }: Params) {
  function updateNumJumps(unlocked: boolean) {
    player.numJumps = unlocked ? 2 : 1;
  }

  updateNumJumps(state.current().isDoubleJumpUnlocked);

  state.subscribe("isDoubleJumpUnlocked", updateNumJumps);
}
