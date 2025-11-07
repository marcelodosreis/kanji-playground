import { PLAYER_ANIMATIONS } from "../../../types/animations.enum";
import type { Player } from "../../../types/player.interface";
import { StateMachine, type StateMachineConfig } from "../../state-machine";

export enum PLAYER_STATE {
  IDLE = "IDLE",
  RUN = "RUN",
  JUMP = "JUMP",
  FALL = "FALL",
  ATTACK = "ATTACK",
  HURT = "HURT",
  DEAD = "DEAD",
}

export type PlayerStateMachine = StateMachine<PlayerContext>;

type PlayerContext = {
  player: Player;
  stateMachine?: PlayerStateMachine;
};

export function createPlayerStateMachine(
  context: Omit<PlayerContext, "stateMachine">
) {
  const ctx = { ...context } as PlayerContext;

  const config: StateMachineConfig<PlayerContext> = {
    initial: PLAYER_STATE.IDLE,
    states: {
      [PLAYER_STATE.IDLE]: {
        onEnter: (ctx) => {
          if (!ctx.player.isAttacking) {
            ctx.player.play(PLAYER_ANIMATIONS.IDLE);
          }
        },
        transitions: {
          RUN: PLAYER_STATE.RUN,
          JUMP: PLAYER_STATE.JUMP,
          FALL: PLAYER_STATE.FALL,
          ATTACK: PLAYER_STATE.ATTACK,
          HURT: PLAYER_STATE.HURT,
          DEAD: PLAYER_STATE.DEAD,
        },
      },
      [PLAYER_STATE.RUN]: {
        onEnter: (ctx) => {
          if (!ctx.player.isAttacking && ctx.player.isGrounded()) {
            ctx.player.play(PLAYER_ANIMATIONS.RUN);
          }
        },
        transitions: {
          IDLE: PLAYER_STATE.IDLE,
          JUMP: PLAYER_STATE.JUMP,
          FALL: PLAYER_STATE.FALL,
          ATTACK: PLAYER_STATE.ATTACK,
          HURT: PLAYER_STATE.HURT,
          DEAD: PLAYER_STATE.DEAD,
        },
      },
      [PLAYER_STATE.JUMP]: {
        onEnter: (ctx) => {
          if (!ctx.player.isAttacking) {
            ctx.player.play(PLAYER_ANIMATIONS.JUMP);
          }
        },
        transitions: {
          IDLE: PLAYER_STATE.IDLE,
          FALL: PLAYER_STATE.FALL,
          ATTACK: PLAYER_STATE.ATTACK,
          HURT: PLAYER_STATE.HURT,
          DEAD: PLAYER_STATE.DEAD,
        },
      },
      [PLAYER_STATE.FALL]: {
        onEnter: (ctx) => {
          if (!ctx.player.isAttacking) {
            ctx.player.play(PLAYER_ANIMATIONS.FALL);
          }
        },
        transitions: {
          IDLE: PLAYER_STATE.IDLE,
          RUN: PLAYER_STATE.RUN,
          ATTACK: PLAYER_STATE.ATTACK,
          HURT: PLAYER_STATE.HURT,
          DEAD: PLAYER_STATE.DEAD,
        },
      },
      [PLAYER_STATE.ATTACK]: {
        onEnter: (ctx) => {
          ctx.player.isAttacking = true;
          ctx.player.play(PLAYER_ANIMATIONS.ATTACK);
        },
        transitions: {
          IDLE: PLAYER_STATE.IDLE,
          RUN: PLAYER_STATE.RUN,
          HURT: PLAYER_STATE.HURT,
          DEAD: PLAYER_STATE.DEAD,
        },
      },
      [PLAYER_STATE.HURT]: {
        onEnter: (ctx) => {
          ctx.player.isKnockedBack = true;
        },
        transitions: {
          IDLE: PLAYER_STATE.IDLE,
          DEAD: PLAYER_STATE.DEAD,
        },
      },
      [PLAYER_STATE.DEAD]: {
        onEnter: (ctx) => {
          ctx.player.play(PLAYER_ANIMATIONS.EXPLODE);
        },
        transitions: {},
      },
    },
  };

  const stateMachine = new StateMachine<PlayerContext>(config, ctx);
  ctx.stateMachine = stateMachine;
  return stateMachine;
}