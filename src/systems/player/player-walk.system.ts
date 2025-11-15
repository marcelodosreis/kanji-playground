import { PLAYER_ANIMATIONS } from "../../types/animations.enum";
import type { Engine } from "../../types/engine.type";
import type { Player } from "../../types/player.interface";
import { type PlayerStateMachine } from "./player-state-machine";

type Params = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
  orientationSystem: {
    requestOrientation: (direction: "left" | "right") => void;
  };
  inputSystem: {
    isMovementKeyPressed: () => boolean;
  };
};

type Direction = -1 | 1;

type MovementState = {
  isMoving: boolean;
};

const MOVEMENT = {
  DIRECTION: {
    LEFT: -1 as Direction,
    RIGHT: 1 as Direction,
  },
} as const;

const getOrientationDirection = (direction: Direction): "left" | "right" =>
  direction === MOVEMENT.DIRECTION.LEFT ? "left" : "right";

const calculateVelocity = (direction: Direction, speed: number): number =>
  direction * speed;

const shouldRun = (
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

const shouldIdle = (
  player: Player,
  stateMachine: PlayerStateMachine
): boolean => {
  const state = stateMachine.getState();
  return state === PLAYER_ANIMATIONS.RUN && player.isGrounded();
};

export function PlayerWalkSystem({
  engine,
  player,
  stateMachine,
  orientationSystem,
  inputSystem,
}: Params) {
  const movement: MovementState = { isMoving: false };

  const applyMovement = (direction: Direction): void => {
    const velocity = calculateVelocity(direction, player.speed);
    player.move(velocity, 0);
  };

  const updateOrientation = (direction: Direction): void => {
    orientationSystem.requestOrientation(getOrientationDirection(direction));
  };

  const move = (direction: Direction): void => {
    if (!stateMachine.canMove()) return;

    movement.isMoving = true;
    updateOrientation(direction);
    applyMovement(direction);

    if (!stateMachine.isAttacking() && shouldRun(player, stateMachine)) {
      stateMachine.dispatch("RUN");
    }
  };

  const handleMovementStop = (): void => {
    if (!movement.isMoving) return;
    if (inputSystem.isMovementKeyPressed()) return;

    movement.isMoving = false;
    if (shouldIdle(player, stateMachine)) {
      stateMachine.dispatch("IDLE");
    }
  };

  const handleFallTransition = (): void => {
    const state = stateMachine.getState();
    if (state === PLAYER_ANIMATIONS.RUN && !player.isGrounded()) {
      stateMachine.dispatch("FALL");
    }
  };

  engine.onUpdate(() => {
    handleMovementStop();
    handleFallTransition();
  });

  return {
    moveLeft: () => move(MOVEMENT.DIRECTION.LEFT),
    moveRight: () => move(MOVEMENT.DIRECTION.RIGHT),
  };
}
