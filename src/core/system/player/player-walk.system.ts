import { PLAYER_ANIMATIONS } from "../../../types/animations.enum";
import type { Engine } from "../../../types/engine.type";
import type { Player } from "../../../types/player.interface";
import { isPaused } from "../../../utils/is-paused";
import { type PlayerStateMachine } from "./player-state-machine";

type Params = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
};

type Direction = -1 | 1;

type MovementState = {
  isMoving: boolean;
};

const MOVEMENT = {
  KEYS: {
    LEFT: "left",
    RIGHT: "right",
  },
  DIRECTION: {
    LEFT: -1 as Direction,
    RIGHT: 1 as Direction,
  },
} as const;

const isMovementKey = (key: string): boolean =>
  key === MOVEMENT.KEYS.LEFT || key === MOVEMENT.KEYS.RIGHT;

const getDirection = (key: string): Direction | null => {
  if (key === MOVEMENT.KEYS.LEFT) return MOVEMENT.DIRECTION.LEFT;
  if (key === MOVEMENT.KEYS.RIGHT) return MOVEMENT.DIRECTION.RIGHT;
  return null;
};

const calculateVelocity = (direction: Direction, speed: number): number =>
  direction * speed;

const shouldFlipLeft = (direction: Direction): boolean =>
  direction === MOVEMENT.DIRECTION.LEFT;

const isAnyMovementKeyPressed = (engine: Engine): boolean =>
  engine.isKeyDown(MOVEMENT.KEYS.LEFT) || engine.isKeyDown(MOVEMENT.KEYS.RIGHT);

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

export function PlayerWalkSystem({ engine, player, stateMachine }: Params) {
  player.controlHandlers = player.controlHandlers || [];

  const movement: MovementState = { isMoving: false };

  const applyMovement = (direction: Direction): void => {
    const velocity = calculateVelocity(direction, player.speed);
    player.move(velocity, 0);
  };

  const updateOrientation = (direction: Direction): void => {
    if (!stateMachine.isAttacking()) {
      player.flipX = shouldFlipLeft(direction);
    }
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

  const onKeyDown = (key: string): void => {
    if (isPaused() || !isMovementKey(key)) return;
    const direction = getDirection(key);
    if (direction) move(direction);
  };

  const handleMovementStop = (): void => {
    if (!movement.isMoving) return;
    if (isAnyMovementKeyPressed(engine)) return;

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

  player.controlHandlers.push(engine.onKeyDown(onKeyDown));

  engine.onUpdate(() => {
    handleMovementStop();
    handleFallTransition();
  });
}
