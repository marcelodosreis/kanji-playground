import { PLAYER_ANIMATIONS } from "../../../types/animations.enum";
import type { Player } from "../../../types/player.interface";
import { StateMachine, type StateMachineConfig } from "../../state-machine";

type PlayerContext = {
  player: Player;
  stateMachine: PlayerStateMachine;
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
};

const COMMON_TRANSITIONS = {
  ATTACK: PLAYER_ANIMATIONS.ATTACK,
  HURT: PLAYER_ANIMATIONS.HURT,
  EXPLODE: PLAYER_ANIMATIONS.EXPLODE,
};

const LOCOMOTION_TRANSITIONS = {
  IDLE: PLAYER_ANIMATIONS.IDLE,
  RUN: PLAYER_ANIMATIONS.RUN,
  JUMP: PLAYER_ANIMATIONS.JUMP,
  FALL: PLAYER_ANIMATIONS.FALL,
  ...COMMON_TRANSITIONS,
};

const createStateHandlers = () =>
  ({
    [PLAYER_ANIMATIONS.IDLE]: (ctx: PlayerContext): void => {
      ctx.player.play(PLAYER_ANIMATIONS.IDLE);
    },

    [PLAYER_ANIMATIONS.RUN]: (ctx: PlayerContext): void => {
      if (ctx.player.isGrounded()) {
        ctx.player.play(PLAYER_ANIMATIONS.RUN);
      }
    },

    [PLAYER_ANIMATIONS.JUMP]: (ctx: PlayerContext): void => {
      ctx.player.play(PLAYER_ANIMATIONS.JUMP);
    },

    [PLAYER_ANIMATIONS.FALL]: (ctx: PlayerContext): void => {
      ctx.player.play(PLAYER_ANIMATIONS.FALL);
    },

    [PLAYER_ANIMATIONS.ATTACK]: (ctx: PlayerContext): void => {
      ctx.player.play(PLAYER_ANIMATIONS.ATTACK);
    },

    [PLAYER_ANIMATIONS.HURT]: (ctx: PlayerContext): void => {
      ctx.player.play(PLAYER_ANIMATIONS.HURT);
    },

    [PLAYER_ANIMATIONS.EXPLODE]: (ctx: PlayerContext): void => {
      ctx.player.play(PLAYER_ANIMATIONS.EXPLODE);
    },
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
          IDLE: PLAYER_ANIMATIONS.IDLE,
          FALL: PLAYER_ANIMATIONS.FALL,
          ...COMMON_TRANSITIONS,
        },
      },
      [PLAYER_ANIMATIONS.FALL]: {
        onEnter: handlers[PLAYER_ANIMATIONS.FALL],
        transitions: {
          IDLE: PLAYER_ANIMATIONS.IDLE,
          RUN: PLAYER_ANIMATIONS.RUN,
          ...COMMON_TRANSITIONS,
        },
      },
      [PLAYER_ANIMATIONS.ATTACK]: {
        onEnter: handlers[PLAYER_ANIMATIONS.ATTACK],
        transitions: {
          IDLE: PLAYER_ANIMATIONS.IDLE,
          RUN: PLAYER_ANIMATIONS.RUN,
          HURT: PLAYER_ANIMATIONS.HURT,
          EXPLODE: PLAYER_ANIMATIONS.EXPLODE,
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

export function createPlayerStateMachine(
  context: Omit<PlayerContext, "stateMachine">
): PlayerStateMachine {
  const config = createStateMachineConfig();
  const ctx = { ...context } as PlayerContext;

  const stateMachine = new PlayerStateMachine(config, ctx);
  ctx.stateMachine = stateMachine;

  return stateMachine;
}

export type { PlayerStateMachine };
export { StatePredicates };
