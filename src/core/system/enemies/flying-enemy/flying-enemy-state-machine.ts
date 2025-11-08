import type { Enemy } from "../../../../types/enemy.interface";
import type { Engine } from "../../../../types/engine.interface";
import { FLYING_ENEMY_EVENTS } from "../../../../types/events.enum";
import type { Player } from "../../../../types/player.interface";
import { GLOBAL_STATE } from "../../../../types/state.interface";

import { GLOBAL_STATE_CONTROLLER } from "../../../global-state-controller";
import { StateMachine, type StateMachineConfig } from "../../../state-machine";

type FlyingEnemyContext = {
  engine: Engine;
  enemy: Enemy;
  player: Player;
};

type FlyingEnemyContextWithMachine = FlyingEnemyContext & {
  stateMachine: FlyingEnemyStateMachine;
};

class FlyingEnemyStateMachine extends StateMachine<FlyingEnemyContextWithMachine> {
  public isPatrolling = (): boolean => {
    const state = this.getState();
    return (
      state === FLYING_ENEMY_EVENTS.PATROL_LEFT ||
      state === FLYING_ENEMY_EVENTS.PATROL_RIGHT
    );
  };

  public isAttacking = (): boolean =>
    this.getState() === FLYING_ENEMY_EVENTS.ATTACK;

  public isReturning = (): boolean =>
    this.getState() === FLYING_ENEMY_EVENTS.RETURN;

  public isAlert = (): boolean => this.getState() === FLYING_ENEMY_EVENTS.ALERT;
}

const createStateMachineConfig =
  (): StateMachineConfig<FlyingEnemyContextWithMachine> => {
    return {
      initial: FLYING_ENEMY_EVENTS.PATROL_RIGHT,
      states: {
        [FLYING_ENEMY_EVENTS.PATROL_RIGHT]: {
          transitions: {
            [FLYING_ENEMY_EVENTS.PATROL_LEFT]: FLYING_ENEMY_EVENTS.PATROL_LEFT,
            [FLYING_ENEMY_EVENTS.ALERT]: FLYING_ENEMY_EVENTS.ALERT,
          },
        },
        [FLYING_ENEMY_EVENTS.PATROL_LEFT]: {
          transitions: {
            [FLYING_ENEMY_EVENTS.PATROL_RIGHT]:
              FLYING_ENEMY_EVENTS.PATROL_RIGHT,
            [FLYING_ENEMY_EVENTS.ALERT]: FLYING_ENEMY_EVENTS.ALERT,
          },
        },
        [FLYING_ENEMY_EVENTS.ALERT]: {
          transitions: {
            [FLYING_ENEMY_EVENTS.ATTACK]: FLYING_ENEMY_EVENTS.ATTACK,
            [FLYING_ENEMY_EVENTS.RETURN]: FLYING_ENEMY_EVENTS.RETURN,
          },
        },
        [FLYING_ENEMY_EVENTS.ATTACK]: {
          transitions: {
            [FLYING_ENEMY_EVENTS.RETURN]: FLYING_ENEMY_EVENTS.RETURN,
          },
        },
        [FLYING_ENEMY_EVENTS.RETURN]: {
          transitions: {
            [FLYING_ENEMY_EVENTS.ALERT]: FLYING_ENEMY_EVENTS.ALERT,
            [FLYING_ENEMY_EVENTS.PATROL_RIGHT]:
              FLYING_ENEMY_EVENTS.PATROL_RIGHT,
          },
        },
      },
    };
  };

export function createFlyingEnemyStateMachine(
  context: FlyingEnemyContext
): FlyingEnemyStateMachine {
  const config = createStateMachineConfig();
  const ctx = { ...context } as FlyingEnemyContextWithMachine;

  const stateMachine = new FlyingEnemyStateMachine(config, ctx);
  ctx.stateMachine = stateMachine;

  function handlePauseStateChange(paused: boolean): void {
    if (!paused) {
      stateMachine.enterState(stateMachine.getState());
    }
  }

  GLOBAL_STATE_CONTROLLER.subscribe(
    GLOBAL_STATE.IS_PAUSED,
    handlePauseStateChange
  );

  ctx.enemy.enterState = (state: string): void => {
    stateMachine.enterState(state);
  };

  ctx.enemy.state = stateMachine.getState();

  ctx.engine.onUpdate(() => {
    ctx.enemy.state = stateMachine.getState();
    stateMachine.update();
  });

  return stateMachine;
}

export type { FlyingEnemyStateMachine };
