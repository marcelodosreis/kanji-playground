import type { Engine } from "../../types/engine.type";
import type { Player } from "../../types/player.interface";
import type { PlayerStateMachine } from "./player-state-machine";
import { PLAYER_ANIMATIONS } from "../../types/animations.enum";
import type { PlayerSystemWithAPI } from "../../types/player-system.interface";
import { PlayerStateTransition } from "./player-state-machine";
import { PLAYER_CONFIG } from "../../constansts/player.constat";

type Params = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
};

const JUMP_END_FRAME = PLAYER_CONFIG.jump.endFrame;

const shouldSkipAnimationChange = (
  state: PLAYER_ANIMATIONS,
  player: Player
): boolean => {
  if (state === PLAYER_ANIMATIONS.RUN && !player.isGrounded()) {
    return true;
  }
  return false;
};

const isAerialState = (state: PLAYER_ANIMATIONS): boolean =>
  state === PLAYER_ANIMATIONS.JUMP || state === PLAYER_ANIMATIONS.FALL;

const shouldTransitionJumpToFall = (
  currentState: PLAYER_ANIMATIONS,
  animFrame: number,
  isGrounded: boolean
): boolean =>
  currentState === PLAYER_ANIMATIONS.JUMP &&
  animFrame >= JUMP_END_FRAME &&
  !isGrounded;

const shouldTransitionAerialToIdle = (
  currentState: PLAYER_ANIMATIONS,
  isGrounded: boolean
): boolean => isGrounded && isAerialState(currentState);

export function PlayerAnimationSystem({
  engine,
  player,
  stateMachine,
}: Params): PlayerSystemWithAPI<{}> {
  let lastState: PLAYER_ANIMATIONS | null = null;

  const playAnimation = (state: PLAYER_ANIMATIONS): void => {
    player.play(state);
  };

  const handleJumpAnimationTransitions = (): void => {
    const currentState = stateMachine.getState() as PLAYER_ANIMATIONS;
    const isGrounded = player.isGrounded();

    if (shouldTransitionAerialToIdle(currentState, isGrounded)) {
      stateMachine.transitionTo(PlayerStateTransition.IDLE);
      return;
    }

    if (shouldTransitionJumpToFall(currentState, player.animFrame, isGrounded)) {
      stateMachine.transitionTo(PlayerStateTransition.FALL);
    }
  };

  const updateAnimationState = (): void => {
    const currentState = stateMachine.getState() as PLAYER_ANIMATIONS;

    handleJumpAnimationTransitions();

    if (currentState === lastState) return;

    if (shouldSkipAnimationChange(currentState, player)) return;

    playAnimation(currentState);
    lastState = currentState;
  };

  const update = (): void => {
    updateAnimationState();
  };

  engine.onUpdate(update);

  return {
    update,
  };
}