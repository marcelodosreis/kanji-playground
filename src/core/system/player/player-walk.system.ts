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

const MOVEMENT_CONFIG = {
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
  key === MOVEMENT_CONFIG.KEYS.LEFT || key === MOVEMENT_CONFIG.KEYS.RIGHT;

const getDirectionFromKey = (key: string): Direction | null => {
  if (key === MOVEMENT_CONFIG.KEYS.LEFT) return MOVEMENT_CONFIG.DIRECTION.LEFT;
  if (key === MOVEMENT_CONFIG.KEYS.RIGHT)
    return MOVEMENT_CONFIG.DIRECTION.RIGHT;
  return null;
};

const shouldFlipLeft = (direction: Direction): boolean =>
  direction === MOVEMENT_CONFIG.DIRECTION.LEFT;

const calculateVelocity = (direction: Direction, speed: number): number =>
  direction * speed;

const isAnyMovementKeyPressed = (engine: Engine): boolean =>
  engine.isKeyDown(MOVEMENT_CONFIG.KEYS.LEFT) ||
  engine.isKeyDown(MOVEMENT_CONFIG.KEYS.RIGHT);

const shouldTransitionToRun = (
  player: Player,
  stateMachine: PlayerStateMachine
): boolean => {
  const current = stateMachine.getState();
  return (
    player.isGrounded() &&
    current !== PLAYER_ANIMATIONS.RUN &&
    current !== PLAYER_ANIMATIONS.ATTACK
  );
};

const shouldTransitionToIdle = (
  player: Player,
  stateMachine: PlayerStateMachine
): boolean => {
  const current = stateMachine.getState();
  return current === PLAYER_ANIMATIONS.RUN && player.isGrounded();
};

export function PlayerWalkSystem({ engine, player, stateMachine }: Params) {
  player.controlHandlers = player.controlHandlers || [];

  const movementState: MovementState = {
    isMoving: false,
  };

  const applyMovement = (direction: Direction): void => {
    const velocity = calculateVelocity(direction, player.speed);
    player.move(velocity, 0);
  };

  const updatePlayerOrientation = (direction: Direction): void => {
    player.flipX = shouldFlipLeft(direction);
  };

  const move = (direction: Direction): void => {
    if (!stateMachine.canMove()) return;

    movementState.isMoving = true;

    if (stateMachine.isAttacking()) {
      applyMovement(direction);
      return;
    }

    if (shouldTransitionToRun(player, stateMachine)) {
      stateMachine.dispatch("RUN");
    }

    updatePlayerOrientation(direction);
    applyMovement(direction);
  };

  const handleMovementKeyDown = (key: string): void => {
    if (isPaused() || !isMovementKey(key)) return;

    const direction = getDirectionFromKey(key);
    if (direction) {
      move(direction);
    }
  };

  const handleMovementStop = (): void => {
    if (!movementState.isMoving) return;
    if (isAnyMovementKeyPressed(engine)) return;

    movementState.isMoving = false;

    if (shouldTransitionToIdle(player, stateMachine)) {
      stateMachine.dispatch("IDLE");
    }
  };

  player.controlHandlers.push(engine.onKeyDown(handleMovementKeyDown));
  engine.onUpdate(handleMovementStop);
}
