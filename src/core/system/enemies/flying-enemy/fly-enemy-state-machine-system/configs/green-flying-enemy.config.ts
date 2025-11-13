import { FLYING_ENEMY_EVENTS } from "../../../../../../types/events.enum";
import type { StateMachineConfig } from "../../../../../state-machine";
import type { FlyingEnemyContextWithMachine } from "..";
import { createStateHandlers } from "../handlers";

export function createGreenFlyingEnemyStateMachine(): StateMachineConfig<FlyingEnemyContextWithMachine> {
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
          [FLYING_ENEMY_EVENTS.PATROL_RIGHT]: FLYING_ENEMY_EVENTS.PATROL_RIGHT,
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
          [FLYING_ENEMY_EVENTS.EXPLODE]: FLYING_ENEMY_EVENTS.EXPLODE,
        },
      },
      [FLYING_ENEMY_EVENTS.RETURN]: {
        onEnter: handlers[FLYING_ENEMY_EVENTS.RETURN],
        transitions: {
          [FLYING_ENEMY_EVENTS.PATROL_RIGHT]: FLYING_ENEMY_EVENTS.PATROL_RIGHT,
          [FLYING_ENEMY_EVENTS.EXPLODE]: FLYING_ENEMY_EVENTS.EXPLODE,
        },
      },
      [FLYING_ENEMY_EVENTS.EXPLODE]: {
        onEnter: handlers[FLYING_ENEMY_EVENTS.EXPLODE],
        transitions: {},
      },
    },
  };
}
