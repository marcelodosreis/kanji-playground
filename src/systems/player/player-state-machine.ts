import { PLAYER_ANIMATIONS } from "../../types/animations.enum";
import type { Player } from "../../types/player.interface";
import {
  StateMachine,
  type StateMachineConfig,
} from "../../core/state-machine";

export enum PlayerDirection {
  LEFT = -1,
  RIGHT = 1,
}

export enum PlayerStateTransition {
  IDLE = "IDLE",
  RUN = "RUN",
  JUMP = "JUMP",
  FALL = "FALL",
  ATTACK = "ATTACK",
  HURT = "HURT",
  EXPLODE = "EXPLODE",
}

export type PlayerContext = {
  player: Player;

  movement: {
    isMoving: boolean;
    direction: PlayerDirection;
  };

  orientation: {
    desiredDirection: PlayerDirection | null;
    isLocked: boolean;
    lockedDirection: PlayerDirection | null;
  };

  combat: {
    isAttacking: boolean;
    currentHitboxDestroy: (() => void) | null;
    lastCheckedAttackFrame: number;
  };

  jump: {
    jumpsPerformed: number;
    wasGrounded: boolean;
    leftGroundTimestamp: number;
    lastJumpTimestamp: number;
    lastReleaseTimestamp: number;
    hasReleasedAfterLastJump: boolean;
    holdActive: boolean;
    holdStartTimestamp: number;
    savedGravityScale: number;
  };

  health: {
    isHurtLocked: boolean;
  };
};

type PlayerState = PLAYER_ANIMATIONS;

const StatePredicates = {
  isAttacking: (state: PlayerState): boolean =>
    state === PLAYER_ANIMATIONS.ATTACK,

  isKnockedBack: (state: PlayerState): boolean =>
    state === PLAYER_ANIMATIONS.HURT,

  canMove: (state: PlayerState): boolean => state !== PLAYER_ANIMATIONS.EXPLODE,

  isInLocomotionState: (state: PlayerState): boolean =>
    [
      PLAYER_ANIMATIONS.IDLE,
      PLAYER_ANIMATIONS.RUN,
      PLAYER_ANIMATIONS.JUMP,
      PLAYER_ANIMATIONS.FALL,
    ].includes(state),

  isGroundedLocomotion: (state: PlayerState): boolean =>
    state === PLAYER_ANIMATIONS.IDLE || state === PLAYER_ANIMATIONS.RUN,

  isAerial: (state: PlayerState): boolean =>
    state === PLAYER_ANIMATIONS.JUMP || state === PLAYER_ANIMATIONS.FALL,
};

const COMMON_TRANSITIONS = {
  [PlayerStateTransition.ATTACK]: PLAYER_ANIMATIONS.ATTACK,
  [PlayerStateTransition.HURT]: PLAYER_ANIMATIONS.HURT,
  [PlayerStateTransition.EXPLODE]: PLAYER_ANIMATIONS.EXPLODE,
};

const LOCOMOTION_TRANSITIONS = {
  [PlayerStateTransition.IDLE]: PLAYER_ANIMATIONS.IDLE,
  [PlayerStateTransition.RUN]: PLAYER_ANIMATIONS.RUN,
  [PlayerStateTransition.JUMP]: PLAYER_ANIMATIONS.JUMP,
  [PlayerStateTransition.FALL]: PLAYER_ANIMATIONS.FALL,
  ...COMMON_TRANSITIONS,
};

const createStateHandlers = () => ({
  [PLAYER_ANIMATIONS.IDLE]: (_ctx: PlayerContext): void => {},
  [PLAYER_ANIMATIONS.RUN]: (_ctx: PlayerContext): void => {},
  [PLAYER_ANIMATIONS.JUMP]: (_ctx: PlayerContext): void => {},
  [PLAYER_ANIMATIONS.FALL]: (_ctx: PlayerContext): void => {},
  [PLAYER_ANIMATIONS.ATTACK]: (_ctx: PlayerContext): void => {},
  [PLAYER_ANIMATIONS.HURT]: (_ctx: PlayerContext): void => {},
  [PLAYER_ANIMATIONS.EXPLODE]: (_ctx: PlayerContext): void => {},
});

class PlayerStateMachine extends StateMachine<PlayerContext> {
  public isAttacking = (): boolean =>
    StatePredicates.isAttacking(this.getState() as PlayerState);

  public isKnockedBack = (): boolean =>
    StatePredicates.isKnockedBack(this.getState() as PlayerState);

  public canMove = (): boolean =>
    StatePredicates.canMove(this.getState() as PlayerState);

  public isInLocomotionState = (): boolean =>
    StatePredicates.isInLocomotionState(this.getState() as PlayerState);

  public isGroundedLocomotion = (): boolean =>
    StatePredicates.isGroundedLocomotion(this.getState() as PlayerState);

  public isAerial = (): boolean =>
    StatePredicates.isAerial(this.getState() as PlayerState);

  public transitionTo(transition: PlayerStateTransition): void {
    this.dispatch(transition);
  }
}

const createStateMachineConfig = (): StateMachineConfig<PlayerContext> => {
  const handlers = createStateHandlers();

  return {
    initial: PLAYER_ANIMATIONS.IDLE,
    states: {
      [PLAYER_ANIMATIONS.IDLE]: {
        onEnter: handlers[PLAYER_ANIMATIONS.IDLE],
        transitions: LOCOMOTION_TRANSITIONS,
      },
      [PLAYER_ANIMATIONS.RUN]: {
        onEnter: handlers[PLAYER_ANIMATIONS.RUN],
        transitions: LOCOMOTION_TRANSITIONS,
      },
      [PLAYER_ANIMATIONS.JUMP]: {
        onEnter: handlers[PLAYER_ANIMATIONS.JUMP],
        transitions: {
          [PlayerStateTransition.IDLE]: PLAYER_ANIMATIONS.IDLE,
          [PlayerStateTransition.FALL]: PLAYER_ANIMATIONS.FALL,
          ...COMMON_TRANSITIONS,
        },
      },
      [PLAYER_ANIMATIONS.FALL]: {
        onEnter: handlers[PLAYER_ANIMATIONS.FALL],
        transitions: {
          [PlayerStateTransition.IDLE]: PLAYER_ANIMATIONS.IDLE,
          [PlayerStateTransition.RUN]: PLAYER_ANIMATIONS.RUN,
          ...COMMON_TRANSITIONS,
        },
      },
      [PLAYER_ANIMATIONS.ATTACK]: {
        onEnter: handlers[PLAYER_ANIMATIONS.ATTACK],
        transitions: {
          [PlayerStateTransition.IDLE]: PLAYER_ANIMATIONS.IDLE,
          [PlayerStateTransition.RUN]: PLAYER_ANIMATIONS.RUN,
          [PlayerStateTransition.HURT]: PLAYER_ANIMATIONS.HURT,
          [PlayerStateTransition.EXPLODE]: PLAYER_ANIMATIONS.EXPLODE,
        },
      },
      [PLAYER_ANIMATIONS.HURT]: {
        onEnter: handlers[PLAYER_ANIMATIONS.HURT],
        transitions: LOCOMOTION_TRANSITIONS,
      },
      [PLAYER_ANIMATIONS.EXPLODE]: {
        onEnter: handlers[PLAYER_ANIMATIONS.EXPLODE],
        transitions: {},
      },
    },
  };
};

export function createPlayerStateMachine(player: Player): PlayerStateMachine {
  const context: PlayerContext = {
    player,

    movement: {
      isMoving: false,
      direction: PlayerDirection.RIGHT,
    },

    orientation: {
      desiredDirection: null,
      isLocked: false,
      lockedDirection: null,
    },

    combat: {
      isAttacking: false,
      currentHitboxDestroy: null,
      lastCheckedAttackFrame: -1,
    },

    jump: {
      jumpsPerformed: 0,
      wasGrounded: player.isGrounded(),
      leftGroundTimestamp: -Infinity,
      lastJumpTimestamp: -Infinity,
      lastReleaseTimestamp: -Infinity,
      hasReleasedAfterLastJump: true,
      holdActive: false,
      holdStartTimestamp: 0,
      savedGravityScale: player.gravityScale,
    },

    health: {
      isHurtLocked: false,
    },
  };

  const config = createStateMachineConfig();
  return new PlayerStateMachine(config, context);
}

export type { PlayerStateMachine };
export { StatePredicates };
