import { PLAYER_ANIMATIONS } from "../../../types/animations.enum";
import type { Engine } from "../../../types/engine.type";
import type { Player } from "../../../types/player.interface";
import { GLOBAL_STATE } from "../../../types/global-state.enum";
import { isPaused } from "../../../utils/is-paused";
import { GLOBAL_STATE_CONTROLLER } from "../../global-state-controller";
import { type PlayerStateMachine } from "./player-state-machine";

type Params = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
};

type Velocity = {
  x: number;
  y: number;
};

type PhysicsState = {
  savedVelocity: Velocity;
  originalGravityScale: number;
};

const JumpSettings = {
  INPUT_KEY: "x",
  JUMP_END_FRAME: 4,
  MAX_JUMPS_ALLOWED: 2,
};

const AerialStates = [PLAYER_ANIMATIONS.JUMP, PLAYER_ANIMATIONS.FALL];

const isAerialAnimation = (animation?: string): boolean => {
  if (animation === undefined) {
    return false;
  }
  return AerialStates.includes(animation as PLAYER_ANIMATIONS);
};

const isJumpKeyPressed = (key: string): boolean => {
  return key === JumpSettings.INPUT_KEY;
};

const canInitiateJumpAction = (machine: PlayerStateMachine): boolean => {
  return !isPaused() && machine.canMove();
};

const shouldTransitionToFallState = (
  currentState: string,
  frame: number,
  grounded: boolean
): boolean => {
  return (
    currentState === PLAYER_ANIMATIONS.JUMP &&
    frame >= JumpSettings.JUMP_END_FRAME &&
    !grounded
  );
};

const shouldTransitionToIdleState = (
  currentState: string,
  grounded: boolean
): boolean => {
  return grounded && isAerialAnimation(currentState);
};

const createVector = (x: number, y: number): Velocity => {
  return { x, y };
};

const savePlayerVelocity = (player: Player): Velocity => {
  return createVector(player.vel.x, player.vel.y);
};

const setPlayerVelocity = (player: Player, velocity: Velocity): void => {
  player.vel.x = velocity.x;
  player.vel.y = velocity.y;
};

const disablePhysicsDuringPause = (player: Player): void => {
  setPlayerVelocity(player, createVector(0, 0));
  player.gravityScale = 0;
};

const restorePhysicsAfterPause = (
  player: Player,
  velocity: Velocity,
  gravityScale: number
): void => {
  player.gravityScale = gravityScale;
  setPlayerVelocity(player, velocity);
};

const updateDoubleJumpAvailability = (player: Player): void => {
  const isUnlocked =
    GLOBAL_STATE_CONTROLLER.current()[GLOBAL_STATE.IS_DOUBLE_JUMB_UNLOCKED];
  if (isUnlocked && player.numJumps !== JumpSettings.MAX_JUMPS_ALLOWED) {
    player.numJumps = JumpSettings.MAX_JUMPS_ALLOWED;
  }
};

export function PlayerJumpSystem({ engine, player, stateMachine }: Params) {
  player.controlHandlers = player.controlHandlers || [];

  const physicsState: PhysicsState = {
    savedVelocity: createVector(0, 0),
    originalGravityScale: player.gravityScale,
  };

  let jumpsExecuted = 0;
  let wasGroundedLastFrame = player.isGrounded();

  const executeJumpIfPossible = (): boolean => {
    if (player.isGrounded()) {
      player.doubleJump();
      jumpsExecuted = 1;
      return true;
    }

    const canPerformDoubleJump = jumpsExecuted === 1 && player.numJumps > 0;
    if (canPerformDoubleJump) {
      player.doubleJump();
      jumpsExecuted = 2;
      return true;
    }

    return false;
  };

  const handleJumpInput = async (key: string): Promise<void> => {
    if (!isJumpKeyPressed(key) || !canInitiateJumpAction(stateMachine)) {
      return;
    }

    updateDoubleJumpAvailability(player);

    const jumpOccurred = executeJumpIfPossible();

    const currentAnimation = player.curAnim();
    const isValidStateForJump =
      currentAnimation !== undefined &&
      !isAerialAnimation(currentAnimation) &&
      !stateMachine.isAttacking() &&
      stateMachine.getState() !== PLAYER_ANIMATIONS.JUMP;

    if (jumpOccurred && isValidStateForJump) {
      stateMachine.dispatch("JUMP");
    }
  };

  const handleGamePause = (isPaused: boolean): void => {
    if (isPaused) {
      physicsState.savedVelocity = savePlayerVelocity(player);
      disablePhysicsDuringPause(player);
    } else {
      restorePhysicsAfterPause(
        player,
        physicsState.savedVelocity,
        physicsState.originalGravityScale
      );
    }
  };

  const updateJumpStateMachine = (): void => {
    const currentState = stateMachine.getState();
    const isCurrentlyGrounded = player.isGrounded();

    if (isCurrentlyGrounded && !wasGroundedLastFrame) {
      jumpsExecuted = 0;
    }
    wasGroundedLastFrame = isCurrentlyGrounded;

    if (shouldTransitionToIdleState(currentState, isCurrentlyGrounded)) {
      stateMachine.dispatch("IDLE");
      return;
    }

    if (
      shouldTransitionToFallState(
        currentState,
        player.animFrame,
        isCurrentlyGrounded
      )
    ) {
      stateMachine.dispatch("FALL");
    }
  };

  GLOBAL_STATE_CONTROLLER.subscribe(GLOBAL_STATE.IS_PAUSED, handleGamePause);
  player.controlHandlers.push(engine.onKeyPress(handleJumpInput));
  engine.onUpdate(updateJumpStateMachine);
}
