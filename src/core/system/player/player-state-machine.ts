import { PLAYER_ANIMATIONS } from "../../../types/animations.enum";
import type { Player } from "../../../types/player.interface";
import { StateMachine, type StateMachineConfig } from "../../state-machine";

type PlayerContext = {
  player: Player;
  stateMachine: PlayerStateMachine;
};

class PlayerStateMachine extends StateMachine<PlayerContext> {
  public isAttacking(): boolean {
    return this.getState() === PLAYER_ANIMATIONS.ATTACK;
  }

  public isKnockedBack(): boolean {
    return this.getState() === PLAYER_ANIMATIONS.HURT;
  }

  public canMove(): boolean {
    const state = this.getState();
    return (
      state !== PLAYER_ANIMATIONS.HURT && state !== PLAYER_ANIMATIONS.EXPLODE
    );
  }

  public isInLocomotionState(): boolean {
    const state = this.getState();
    return (
      state === PLAYER_ANIMATIONS.IDLE ||
      state === PLAYER_ANIMATIONS.RUN ||
      state === PLAYER_ANIMATIONS.JUMP ||
      state === PLAYER_ANIMATIONS.FALL
    );
  }
}

export function createPlayerStateMachine(
  context: Omit<PlayerContext, "stateMachine">
): PlayerStateMachine {
  const ctx = { ...context } as PlayerContext;

  const config: StateMachineConfig<PlayerContext> = {
    initial: PLAYER_ANIMATIONS.IDLE,
    states: {
      [PLAYER_ANIMATIONS.IDLE]: {
        onEnter: (ctx) => {
          ctx.player.play(PLAYER_ANIMATIONS.IDLE);
        },
        transitions: {
          RUN: PLAYER_ANIMATIONS.RUN,
          JUMP: PLAYER_ANIMATIONS.JUMP,
          FALL: PLAYER_ANIMATIONS.FALL,
          ATTACK: PLAYER_ANIMATIONS.ATTACK,
          HURT: PLAYER_ANIMATIONS.HURT,
          EXPLODE: PLAYER_ANIMATIONS.EXPLODE,
        },
      },
      [PLAYER_ANIMATIONS.RUN]: {
        onEnter: (ctx) => {
          if (ctx.player.isGrounded()) ctx.player.play(PLAYER_ANIMATIONS.RUN);
        },
        transitions: {
          IDLE: PLAYER_ANIMATIONS.IDLE,
          JUMP: PLAYER_ANIMATIONS.JUMP,
          FALL: PLAYER_ANIMATIONS.FALL,
          ATTACK: PLAYER_ANIMATIONS.ATTACK,
          HURT: PLAYER_ANIMATIONS.HURT,
          EXPLODE: PLAYER_ANIMATIONS.EXPLODE,
        },
      },
      [PLAYER_ANIMATIONS.JUMP]: {
        onEnter: (ctx) => {
          ctx.player.play(PLAYER_ANIMATIONS.JUMP);
        },
        transitions: {
          IDLE: PLAYER_ANIMATIONS.IDLE,
          FALL: PLAYER_ANIMATIONS.FALL,
          ATTACK: PLAYER_ANIMATIONS.ATTACK,
          HURT: PLAYER_ANIMATIONS.HURT,
          EXPLODE: PLAYER_ANIMATIONS.EXPLODE,
        },
      },
      [PLAYER_ANIMATIONS.FALL]: {
        onEnter: (ctx) => {
          ctx.player.play(PLAYER_ANIMATIONS.FALL);
        },
        transitions: {
          IDLE: PLAYER_ANIMATIONS.IDLE,
          RUN: PLAYER_ANIMATIONS.RUN,
          ATTACK: PLAYER_ANIMATIONS.ATTACK,
          HURT: PLAYER_ANIMATIONS.HURT,
          EXPLODE: PLAYER_ANIMATIONS.EXPLODE,
        },
      },
      [PLAYER_ANIMATIONS.ATTACK]: {
        onEnter: (ctx) => {
          ctx.player.play(PLAYER_ANIMATIONS.ATTACK);
        },
        transitions: {
          IDLE: PLAYER_ANIMATIONS.IDLE,
          RUN: PLAYER_ANIMATIONS.RUN,
          HURT: PLAYER_ANIMATIONS.HURT,
          EXPLODE: PLAYER_ANIMATIONS.EXPLODE,
        },
      },
      [PLAYER_ANIMATIONS.HURT]: {
        onEnter: (ctx) => {
          ctx.player.play(PLAYER_ANIMATIONS.HURT);
        },
        transitions: {
          IDLE: PLAYER_ANIMATIONS.IDLE,
          EXPLODE: PLAYER_ANIMATIONS.EXPLODE,
        },
      },
      [PLAYER_ANIMATIONS.EXPLODE]: {
        onEnter: (ctx) => {
          ctx.player.play(PLAYER_ANIMATIONS.EXPLODE);
        },
        transitions: {},
      },
    },
  };

  const stateMachine = new PlayerStateMachine(config, ctx);
  ctx.stateMachine = stateMachine;
  return stateMachine;
}

export type { PlayerStateMachine };
