import { PLAYER_CONFIG } from "../../constansts/player.constat";
import { PLAYER_ANIMATIONS } from "../../types/animations.enum";
import type { Engine } from "../../types/engine.type";
import type { PlayerSystemWithAPI } from "../../types/player-system.interface";
import type { Player } from "../../types/player.interface";
import type {
  PlayerStateMachine,
  PlayerDirection,
} from "./player-state-machine";
import { PlayerStateTransition } from "./player-state-machine";

type Params = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
  orientationSystem: {
    requestDirection: (direction: PlayerDirection) => void;
  };
  inputSystem: {
    isMovementKeyPressed: () => boolean;
  };
};

type WalkSystemAPI = {
  moveLeft: () => void;
  moveRight: () => void;
};

const calculateVelocity = (direction: PlayerDirection, speed: number): number =>
  direction * speed;

const shouldTransitionToRun = (
  player: Player,
  stateMachine: PlayerStateMachine
): boolean => {
  const state = stateMachine.getState();
  return (
    player.isGrounded() &&
    state !== PLAYER_ANIMATIONS.RUN &&
    state !== PLAYER_ANIMATIONS.ATTACK
  );
};

const shouldTransitionToIdle = (
  player: Player,
  stateMachine: PlayerStateMachine
): boolean => {
  const state = stateMachine.getState();
  return state === PLAYER_ANIMATIONS.RUN && player.isGrounded();
};

const shouldTransitionToFall = (
  player: Player,
  stateMachine: PlayerStateMachine
): boolean => {
  const state = stateMachine.getState();
  return state === PLAYER_ANIMATIONS.RUN && !player.isGrounded();
};

export function PlayerWalkSystem({
  engine,
  player,
  stateMachine,
  orientationSystem,
  inputSystem,
}: Params): PlayerSystemWithAPI<WalkSystemAPI> {
  const ctx = stateMachine.getContext();

  const applyMovement = (direction: PlayerDirection): void => {
    const velocity = calculateVelocity(direction, player.speed);
    player.move(velocity, 0);
  };

  const move = (direction: PlayerDirection): void => {
    if (!stateMachine.canMove()) return;

    ctx.movement.isMoving = true;
    ctx.movement.direction = direction;

    orientationSystem.requestDirection(direction);
    applyMovement(direction);

    if (
      !stateMachine.isAttacking() &&
      shouldTransitionToRun(player, stateMachine)
    ) {
      stateMachine.transitionTo(PlayerStateTransition.RUN);
    }
  };

  const updateMovementState = (): void => {
    if (!ctx.movement.isMoving) return;
    if (inputSystem.isMovementKeyPressed()) return;

    ctx.movement.isMoving = false;

    if (shouldTransitionToIdle(player, stateMachine)) {
      stateMachine.transitionTo(PlayerStateTransition.IDLE);
    }
  };

  const updateFallTransition = (): void => {
    if (shouldTransitionToFall(player, stateMachine)) {
      stateMachine.transitionTo(PlayerStateTransition.FALL);
    }
  };

  const update = (): void => {
    updateMovementState();
    updateFallTransition();
  };

  engine.onUpdate(update);

  return {
    moveLeft: () =>
      move(PLAYER_CONFIG.movement.direction.left as PlayerDirection),
    moveRight: () =>
      move(PLAYER_CONFIG.movement.direction.right as PlayerDirection),
    update,
  };
}
