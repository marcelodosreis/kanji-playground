import type { Boss } from "../../../../types/boss.interface";
import type { Engine } from "../../../../types/engine.type";
import { BOSS_EVENTS } from "../../../../types/events.enum";
import type { Player } from "../../../../types/player.interface";
import { StateMachine, type StateMachineConfig } from "../../../state-machine";
import { HITBOX_TAGS, TAGS } from "../../../../types/tags.enum";

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
  public isOpenFiring = (): boolean => this.getState() === BOSS_EVENTS.OPEN_FIRE;
  public isFiring = (): boolean => this.getState() === BOSS_EVENTS.FIRE;
  public isShuttingFire = (): boolean => this.getState() === BOSS_EVENTS.SHUT_FIRE;
  public isExploding = (): boolean => this.getState() === BOSS_EVENTS.EXPLODE;
}

const createStateHandlers = () => ({

  [BOSS_EVENTS.IDLE]: (_ctx: BossContextWithMachine) => {},

  [BOSS_EVENTS.RUN]: (_ctx: BossContextWithMachine) => {

  },

  [BOSS_EVENTS.OPEN_FIRE]: (_ctx: BossContextWithMachine) => {

  },

  [BOSS_EVENTS.FIRE]: (ctx: BossContextWithMachine) => {
    const { engine, boss, player } = ctx;

    const offsetX = boss.flipX ? -70 : 0;
    const fireHitbox = boss.add([
      engine.area({ shape: new engine.Rect(engine.vec2(0), 70, 10) }),
      engine.pos(offsetX, 5),
      HITBOX_TAGS.BOSS_FIRE_HITBOX,
    ]);

    fireHitbox.onCollide(TAGS.PLAYER, () => {
      player.hurt(1, boss);
    });

    engine.wait(boss.fireDuration, () => {
      if (ctx.stateMachine.getState() === BOSS_EVENTS.FIRE) {
        ctx.stateMachine.dispatch(BOSS_EVENTS.SHUT_FIRE);
      }
    });
  },

  [BOSS_EVENTS.SHUT_FIRE]: (ctx: BossContextWithMachine) => {
    const { engine } = ctx;

    const fireHitboxes = engine.get(HITBOX_TAGS.BOSS_FIRE_HITBOX, { recursive: true });
    for (const hb of fireHitboxes) {
      engine.destroy(hb);
    }

  },

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