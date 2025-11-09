import type { Boss } from "../../../../types/boss.interface";
import type { Engine } from "../../../../types/engine.type";
import { BOSS_EVENTS } from "../../../../types/events.enum";
import type { Player } from "../../../../types/player.interface";
import { StateMachine, type StateMachineConfig } from "../../../state-machine";
import { TAGS } from "../../../../types/tags.enum";

type BossContext = {
  engine: Engine;
  boss: Boss;
  player: Player;
};

type BossContextWithMachine = BossContext & {
  stateMachine: BossStateMachine;
};

class BossStateMachine extends StateMachine<BossContextWithMachine> {
  public isIdle = (): boolean => this.getState() === BOSS_EVENTS.IDLE;
  public isRunning = (): boolean => this.getState() === BOSS_EVENTS.RUN;
  public isOpenFiring = (): boolean =>
    this.getState() === BOSS_EVENTS.OPEN_FIRE;
  public isFiring = (): boolean => this.getState() === BOSS_EVENTS.FIRE;
  public isShuttingFire = (): boolean =>
    this.getState() === BOSS_EVENTS.SHUT_FIRE;
  public isExploding = (): boolean => this.getState() === BOSS_EVENTS.EXPLODE;
}

const createStateHandlers = () => ({
  [BOSS_EVENTS.IDLE]: (_ctx: BossContextWithMachine) => {},

  [BOSS_EVENTS.RUN]: (_ctx: BossContextWithMachine) => {},

  [BOSS_EVENTS.OPEN_FIRE]: (_ctx: BossContextWithMachine) => {},

  [BOSS_EVENTS.FIRE]: (_ctx: BossContextWithMachine) => {},

  [BOSS_EVENTS.SHUT_FIRE]: (_ctx: BossContextWithMachine) => {},

  [BOSS_EVENTS.EXPLODE]: (ctx: BossContextWithMachine) => {
    ctx.boss.collisionIgnore = [TAGS.PLAYER];
    ctx.boss.unuse("body");
  },
});

const createStateMachineConfig =
  (): StateMachineConfig<BossContextWithMachine> => {
    const handlers = createStateHandlers();

    return {
      initial: BOSS_EVENTS.IDLE,
      states: {
        [BOSS_EVENTS.IDLE]: {
          onEnter: handlers[BOSS_EVENTS.IDLE],
          transitions: {
            [BOSS_EVENTS.RUN]: BOSS_EVENTS.RUN,
          },
        },
        [BOSS_EVENTS.RUN]: {
          onEnter: handlers[BOSS_EVENTS.RUN],
          transitions: {
            [BOSS_EVENTS.OPEN_FIRE]: BOSS_EVENTS.OPEN_FIRE,
          },
        },
        [BOSS_EVENTS.OPEN_FIRE]: {
          onEnter: handlers[BOSS_EVENTS.OPEN_FIRE],
          transitions: {
            [BOSS_EVENTS.FIRE]: BOSS_EVENTS.FIRE,
          },
        },
        [BOSS_EVENTS.FIRE]: {
          onEnter: handlers[BOSS_EVENTS.FIRE],
          transitions: {
            [BOSS_EVENTS.SHUT_FIRE]: BOSS_EVENTS.SHUT_FIRE,
          },
        },
        [BOSS_EVENTS.SHUT_FIRE]: {
          onEnter: handlers[BOSS_EVENTS.SHUT_FIRE],
          transitions: {
            [BOSS_EVENTS.RUN]: BOSS_EVENTS.RUN,
          },
        },
        [BOSS_EVENTS.EXPLODE]: {
          onEnter: handlers[BOSS_EVENTS.EXPLODE],
          transitions: {},
        },
      },
    };
  };

export function createBossStateMachine(context: BossContext): BossStateMachine {
  const config = createStateMachineConfig();
  const ctx = { ...context } as BossContextWithMachine;

  const stateMachine = new BossStateMachine(config, ctx);
  ctx.stateMachine = stateMachine;

  return stateMachine;
}

export type { BossStateMachine, BossContext };
