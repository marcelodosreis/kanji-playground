import type { Engine } from "../../types/engine.type";
import type { PlayerSystemWithAPI } from "../../types/player-system.interface";
import type { Player } from "../../types/player.interface";
import type {
  PlayerStateMachine,
  PlayerDirection,
} from "./player-state-machine";

type Params = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
};

type OrientationSystemAPI = {
  requestDirection: (direction: PlayerDirection) => void;
  lockDirection: () => void;
  unlockDirection: () => void;
};

const getPlayerDirection = (player: Player): PlayerDirection =>
  player.flipX ? -1 : 1;

const setPlayerDirection = (
  player: Player,
  direction: PlayerDirection
): void => {
  player.flipX = direction === -1;
};

export function PlayerOrientationSystem({
  engine,
  player,
  stateMachine,
}: Params): PlayerSystemWithAPI<OrientationSystemAPI> {
  const ctx = stateMachine.getContext();

  const requestDirection = (direction: PlayerDirection): void => {
    ctx.orientation.desiredDirection = direction;
  };

  const lockDirection = (): void => {
    ctx.orientation.isLocked = true;
    ctx.orientation.lockedDirection = getPlayerDirection(player);
  };

  const unlockDirection = (): void => {
    ctx.orientation.isLocked = false;
    ctx.orientation.lockedDirection = null;
  };

  const applyOrientation = (): void => {
    if (ctx.orientation.isLocked && ctx.orientation.lockedDirection !== null) {
      setPlayerDirection(player, ctx.orientation.lockedDirection);
      return;
    }

    if (ctx.orientation.desiredDirection !== null) {
      setPlayerDirection(player, ctx.orientation.desiredDirection);
    }
  };

  const updateLockBasedOnState = (): void => {
    const isAttacking = stateMachine.isAttacking();

    if (isAttacking && !ctx.orientation.isLocked) {
      lockDirection();
    }

    if (!isAttacking && ctx.orientation.isLocked) {
      unlockDirection();
    }
  };

  const update = (): void => {
    updateLockBasedOnState();
    applyOrientation();
  };

  engine.onUpdate(update);

  return {
    requestDirection,
    lockDirection,
    unlockDirection,
    update,
  };
}
