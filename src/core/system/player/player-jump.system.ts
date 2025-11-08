import { PLAYER_ANIMATIONS } from "../../../types/animations.enum";
import type { Engine } from "../../../types/engine.interface";
import type { Player } from "../../../types/player.interface";
import { GLOBAL_STATE } from "../../../types/state.interface";
import { isPaused } from "../../../utils/wrap-with-pause-check";
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

type JumpState = {
  savedVelocity: Velocity;
  originalGravityScale: number;
};

const JUMP_CONFIG = {
  KEY: "x",
  LAST_FRAME: 4,
  MAX_JUMPS: 2,
} as const;

const AERIAL_STATES = [PLAYER_ANIMATIONS.JUMP, PLAYER_ANIMATIONS.FALL];

const isAerialState = (state: string): boolean =>
  AERIAL_STATES.includes(state as PLAYER_ANIMATIONS);

const isJumpKey = (key: string): boolean => key === JUMP_CONFIG.KEY;

const canInitiateJump = (stateMachine: PlayerStateMachine): boolean =>
  !isPaused() && stateMachine.canMove();

const shouldDispatchJump = (
  currentAnim: string | undefined,
  stateMachine: PlayerStateMachine
): boolean => {
  if (currentAnim === undefined) return false;
  if (isAerialState(currentAnim)) return false;
  if (stateMachine.isAttacking()) return false;
  if (stateMachine.getState() === PLAYER_ANIMATIONS.JUMP) return false;
  return true;
};

const shouldTransitionToFall = (
  currentState: string,
  animFrame: number,
  isGrounded: boolean
): boolean =>
  currentState === PLAYER_ANIMATIONS.JUMP &&
  animFrame >= JUMP_CONFIG.LAST_FRAME &&
  !isGrounded;

const shouldTransitionToIdle = (
  currentState: string,
  isGrounded: boolean
): boolean => isGrounded && isAerialState(currentState);

const createVelocity = (x: number, y: number): Velocity => ({ x, y });

const captureVelocity = (player: Player): Velocity =>
  createVelocity(player.vel.x, player.vel.y);

const applyVelocity = (player: Player, velocity: Velocity): void => {
  player.vel.x = velocity.x;
  player.vel.y = velocity.y;
};

const freezePhysics = (player: Player): void => {
  applyVelocity(player, createVelocity(0, 0));
  player.gravityScale = 0;
};

const restorePhysics = (
  player: Player,
  velocity: Velocity,
  gravityScale: number
): void => {
  player.gravityScale = gravityScale;
  applyVelocity(player, velocity);
};

const syncDoubleJumpAbility = (player: Player): void => {
  const isUnlocked =
    GLOBAL_STATE_CONTROLLER.current()[GLOBAL_STATE.IS_DOUBLE_JUMB_UNLOCKED];
  if (isUnlocked && player.numJumps !== JUMP_CONFIG.MAX_JUMPS) {
    player.numJumps = JUMP_CONFIG.MAX_JUMPS;
  }
};

export function PlayerJumpSystem({ engine, player, stateMachine }: Params) {
  player.controlHandlers = player.controlHandlers || [];

  const jumpState: JumpState = {
    savedVelocity: createVelocity(0, 0),
    originalGravityScale: player.gravityScale,
  };

  const handleJumpKey = async (key: string): Promise<void> => {
    if (!isJumpKey(key) || !canInitiateJump(stateMachine)) return;

    syncDoubleJumpAbility(player);
    player.doubleJump();

    const currentAnim = player.curAnim();
    if (shouldDispatchJump(currentAnim, stateMachine)) {
      stateMachine.dispatch("JUMP");
    }
  };

  const handlePauseChange = (paused: boolean): void => {
    if (paused) {
      jumpState.savedVelocity = captureVelocity(player);
      freezePhysics(player);
    } else {
      restorePhysics(
        player,
        jumpState.savedVelocity,
        jumpState.originalGravityScale
      );
    }
  };

  const handleJumpStateTransitions = (): void => {
    const currentState = stateMachine.getState();
    const isGrounded = player.isGrounded();

    if (shouldTransitionToIdle(currentState, isGrounded)) {
      stateMachine.dispatch("IDLE");
      return;
    }

    if (shouldTransitionToFall(currentState, player.animFrame, isGrounded)) {
      stateMachine.dispatch("FALL");
    }
  };

  GLOBAL_STATE_CONTROLLER.subscribe(GLOBAL_STATE.IS_PAUSED, handlePauseChange);
  player.controlHandlers.push(engine.onKeyPress(handleJumpKey));
  engine.onUpdate(handleJumpStateTransitions);
}
