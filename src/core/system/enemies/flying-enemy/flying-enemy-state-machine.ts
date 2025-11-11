import type { Enemy } from "../../../../types/enemy.interface";
import type { Engine } from "../../../../types/engine.type";
import { FLYING_ENEMY_EVENTS } from "../../../../types/events.enum";
import type { Player } from "../../../../types/player.interface";
import { FLYING_ENEMY_SPRITES } from "../../../../types/sprites.enum";
import { StateMachine, type StateMachineConfig } from "../../../state-machine";

type FlyingEnemyContext = {
  engine: Engine;
  enemy: Enemy;
  player: Player;
};

type FlyingEnemyContextWithMachine = FlyingEnemyContext & {
  stateMachine: FlyingEnemyStateMachine;
};

type FlyingEnemyState = FLYING_ENEMY_EVENTS;

const StatePredicates = {
  isPatrolling: (state: FlyingEnemyState): boolean =>
    state === FLYING_ENEMY_EVENTS.PATROL_LEFT ||
    state === FLYING_ENEMY_EVENTS.PATROL_RIGHT,

  isAttacking: (state: FlyingEnemyState): boolean =>
    state === FLYING_ENEMY_EVENTS.ATTACK,

  isReturning: (state: FlyingEnemyState): boolean =>
    state === FLYING_ENEMY_EVENTS.RETURN,

  isAlert: (state: FlyingEnemyState): boolean =>
    state === FLYING_ENEMY_EVENTS.ALERT,

  isExploding: (state: FlyingEnemyState): boolean =>
    state === FLYING_ENEMY_EVENTS.EXPLODE,

  canMove: (state: FlyingEnemyState): boolean =>
    state !== FLYING_ENEMY_EVENTS.EXPLODE,
};

const createStateHandlers = () => ({
  [FLYING_ENEMY_EVENTS.PATROL_RIGHT]: (
    _ctx: FlyingEnemyContextWithMachine
  ): void => {},

  [FLYING_ENEMY_EVENTS.PATROL_LEFT]: (
    _ctx: FlyingEnemyContextWithMachine
  ): void => {},

  [FLYING_ENEMY_EVENTS.ALERT]: (
    _ctx: FlyingEnemyContextWithMachine
  ): void => {},

  [FLYING_ENEMY_EVENTS.ATTACK]: (
    _ctx: FlyingEnemyContextWithMachine
  ): void => {},

  [FLYING_ENEMY_EVENTS.RETURN]: (
    _ctx: FlyingEnemyContextWithMachine
  ): void => {},

  [FLYING_ENEMY_EVENTS.EXPLODE]: (ctx: FlyingEnemyContextWithMachine): void => {
    ctx.enemy.collisionIgnore = ["player"];
    ctx.enemy.unuse("body");
  },
});

class FlyingEnemyStateMachine extends StateMachine<FlyingEnemyContextWithMachine> {
  public isPatrolling = (): boolean =>
    StatePredicates.isPatrolling(this.getState() as FlyingEnemyState);

  public isAttacking = (): boolean =>
    StatePredicates.isAttacking(this.getState() as FlyingEnemyState);

  public isReturning = (): boolean =>
    StatePredicates.isReturning(this.getState() as FlyingEnemyState);

  public isAlert = (): boolean =>
    StatePredicates.isAlert(this.getState() as FlyingEnemyState);

  public isExploding = (): boolean =>
    StatePredicates.isExploding(this.getState() as FlyingEnemyState);

  public canMove = (): boolean =>
    StatePredicates.canMove(this.getState() as FlyingEnemyState);
}

const createFullStateMachineConfig =
  (): StateMachineConfig<FlyingEnemyContextWithMachine> => {
    const handlers = createStateHandlers();

    return {
      initial: FLYING_ENEMY_EVENTS.PATROL_RIGHT,
      states: {
        [FLYING_ENEMY_EVENTS.PATROL_RIGHT]: {
          onEnter: handlers[FLYING_ENEMY_EVENTS.PATROL_RIGHT],
          transitions: {
            [FLYING_ENEMY_EVENTS.PATROL_LEFT]: FLYING_ENEMY_EVENTS.PATROL_LEFT,
            [FLYING_ENEMY_EVENTS.ALERT]: FLYING_ENEMY_EVENTS.ALERT,
            [FLYING_ENEMY_EVENTS.EXPLODE]: FLYING_ENEMY_EVENTS.EXPLODE,
          },
        },
        [FLYING_ENEMY_EVENTS.PATROL_LEFT]: {
          onEnter: handlers[FLYING_ENEMY_EVENTS.PATROL_LEFT],
          transitions: {
            [FLYING_ENEMY_EVENTS.PATROL_RIGHT]:
              FLYING_ENEMY_EVENTS.PATROL_RIGHT,
            [FLYING_ENEMY_EVENTS.ALERT]: FLYING_ENEMY_EVENTS.ALERT,
            [FLYING_ENEMY_EVENTS.EXPLODE]: FLYING_ENEMY_EVENTS.EXPLODE,
          },
        },
        [FLYING_ENEMY_EVENTS.ALERT]: {
          onEnter: handlers[FLYING_ENEMY_EVENTS.ALERT],
          transitions: {
            [FLYING_ENEMY_EVENTS.ATTACK]: FLYING_ENEMY_EVENTS.ATTACK,
            [FLYING_ENEMY_EVENTS.RETURN]: FLYING_ENEMY_EVENTS.RETURN,
            [FLYING_ENEMY_EVENTS.EXPLODE]: FLYING_ENEMY_EVENTS.EXPLODE,
          },
        },
        [FLYING_ENEMY_EVENTS.ATTACK]: {
          onEnter: handlers[FLYING_ENEMY_EVENTS.ATTACK],
          transitions: {
            [FLYING_ENEMY_EVENTS.RETURN]: FLYING_ENEMY_EVENTS.RETURN,
            [FLYING_ENEMY_EVENTS.ALERT]: FLYING_ENEMY_EVENTS.ALERT,
            [FLYING_ENEMY_EVENTS.EXPLODE]: FLYING_ENEMY_EVENTS.EXPLODE,
          },
        },
        [FLYING_ENEMY_EVENTS.RETURN]: {
          onEnter: handlers[FLYING_ENEMY_EVENTS.RETURN],
          transitions: {
            [FLYING_ENEMY_EVENTS.ALERT]: FLYING_ENEMY_EVENTS.ALERT,
            [FLYING_ENEMY_EVENTS.PATROL_RIGHT]:
              FLYING_ENEMY_EVENTS.PATROL_RIGHT,
            [FLYING_ENEMY_EVENTS.EXPLODE]: FLYING_ENEMY_EVENTS.EXPLODE,
          },
        },
        [FLYING_ENEMY_EVENTS.EXPLODE]: {
          onEnter: handlers[FLYING_ENEMY_EVENTS.EXPLODE],
          transitions: {},
        },
      },
    };
  };

const createSimplePatrolConfig =
  (): StateMachineConfig<FlyingEnemyContextWithMachine> => {
    const handlers = createStateHandlers();

    return {
      initial: FLYING_ENEMY_EVENTS.PATROL_RIGHT,
      states: {
        [FLYING_ENEMY_EVENTS.PATROL_RIGHT]: {
          onEnter: handlers[FLYING_ENEMY_EVENTS.PATROL_RIGHT],
          transitions: {
            [FLYING_ENEMY_EVENTS.PATROL_LEFT]: FLYING_ENEMY_EVENTS.PATROL_LEFT,
            [FLYING_ENEMY_EVENTS.EXPLODE]: FLYING_ENEMY_EVENTS.EXPLODE,
          },
        },
        [FLYING_ENEMY_EVENTS.PATROL_LEFT]: {
          onEnter: handlers[FLYING_ENEMY_EVENTS.PATROL_LEFT],
          transitions: {
            [FLYING_ENEMY_EVENTS.PATROL_RIGHT]:
              FLYING_ENEMY_EVENTS.PATROL_RIGHT,
            [FLYING_ENEMY_EVENTS.EXPLODE]: FLYING_ENEMY_EVENTS.EXPLODE,
          },
        },
        [FLYING_ENEMY_EVENTS.EXPLODE]: {
          onEnter: handlers[FLYING_ENEMY_EVENTS.EXPLODE],
          transitions: {},
        },
      },
    };
  };

const createBlueStateMachineConfig =
  (): StateMachineConfig<FlyingEnemyContextWithMachine> => {
    const handlers = createStateHandlers();

    return {
      initial: FLYING_ENEMY_EVENTS.ALERT,
      states: {
        [FLYING_ENEMY_EVENTS.ALERT]: {
          onEnter: handlers[FLYING_ENEMY_EVENTS.ALERT],
          transitions: {
            [FLYING_ENEMY_EVENTS.ATTACK]: FLYING_ENEMY_EVENTS.ATTACK,
            [FLYING_ENEMY_EVENTS.RETURN]: FLYING_ENEMY_EVENTS.RETURN,
            [FLYING_ENEMY_EVENTS.EXPLODE]: FLYING_ENEMY_EVENTS.EXPLODE,
          },
        },
        [FLYING_ENEMY_EVENTS.ATTACK]: {
          onEnter: handlers[FLYING_ENEMY_EVENTS.ATTACK],
          transitions: {
            [FLYING_ENEMY_EVENTS.RETURN]: FLYING_ENEMY_EVENTS.RETURN,
            [FLYING_ENEMY_EVENTS.ALERT]: FLYING_ENEMY_EVENTS.ALERT,
            [FLYING_ENEMY_EVENTS.EXPLODE]: FLYING_ENEMY_EVENTS.EXPLODE,
          },
        },
        [FLYING_ENEMY_EVENTS.RETURN]: {
          onEnter: handlers[FLYING_ENEMY_EVENTS.RETURN],
          transitions: {
            [FLYING_ENEMY_EVENTS.ALERT]: FLYING_ENEMY_EVENTS.ALERT,
            [FLYING_ENEMY_EVENTS.EXPLODE]: FLYING_ENEMY_EVENTS.EXPLODE,
          },
        },
        [FLYING_ENEMY_EVENTS.EXPLODE]: {
          onEnter: handlers[FLYING_ENEMY_EVENTS.EXPLODE],
          transitions: {},
        },
      },
    };
  };

export function createFlyingEnemyStateMachine(
  context: FlyingEnemyContext
): FlyingEnemyStateMachine {
  const ctx = { ...context } as FlyingEnemyContextWithMachine;

  const config =
    ctx.enemy.behavior === FLYING_ENEMY_SPRITES.ORANGE
      ? createSimplePatrolConfig()
      : ctx.enemy.behavior === FLYING_ENEMY_SPRITES.BLUE
      ? createBlueStateMachineConfig()
      : createFullStateMachineConfig();

  const stateMachine = new FlyingEnemyStateMachine(config, ctx);
  ctx.stateMachine = stateMachine;

  return stateMachine;
}

export type { FlyingEnemyStateMachine, FlyingEnemyContext };
export { StatePredicates };
