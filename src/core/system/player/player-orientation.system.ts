import type { Engine } from "../../../types/engine.type";
import type { Player } from "../../../types/player.interface";
import type { PlayerStateMachine } from "./player-state-machine";

type Params = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
};

type Direction = "left" | "right";

type OrientationState = {
  desired: Direction | null;
  locked: Direction | null;
};

const getPlayerDirection = (player: Player): Direction =>
  player.flipX ? "left" : "right";

const setPlayerDirection = (player: Player, direction: Direction): void => {
  player.flipX = direction === "left";
};

export function PlayerOrientationSystem({
  engine,
  player,
  stateMachine,
}: Params) {
  const state: OrientationState = {
    desired: null,
    locked: null,
  };

  const requestOrientation = (direction: Direction): void => {
    state.desired = direction;
  };

  const lockOrientation = (): void => {
    state.locked = getPlayerDirection(player);
  };

  const unlockOrientation = (): void => {
    state.locked = null;
  };

  const applyOrientation = (): void => {
    if (state.locked !== null) {
      setPlayerDirection(player, state.locked);
      return;
    }

    if (state.desired !== null) {
      setPlayerDirection(player, state.desired);
    }
  };

  const handleStateLocking = (): void => {
    if (stateMachine.isAttacking() && state.locked === null) {
      lockOrientation();
    }

    if (!stateMachine.isAttacking() && state.locked !== null) {
      unlockOrientation();
    }
  };

  engine.onUpdate(() => {
    handleStateLocking();
    applyOrientation();
  });

  return {
    requestOrientation,
    lockOrientation,
    unlockOrientation,
  };
}
