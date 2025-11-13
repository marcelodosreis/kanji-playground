import type { Enemy } from "../../../../types/enemy.interface";
import type { Engine } from "../../../../types/engine.type";
import { FLYING_ENEMY_EVENTS } from "../../../../types/events.enum";
import type { Player } from "../../../../types/player.interface";
import { FLYING_ENEMY_SPRITES } from "../../../../types/sprites.enum";
import {
  StateMachine,
  type StateMachineConfig,
} from "../../../../core/state-machine";

import { createBlackFlyingEnemyStateMachine } from "./configs/black-flying-enemy.config";
import { createBlueFlyingEnemyStateMachine } from "./configs/blue-flying-enemy.config";
import { createGreenFlyingEnemyStateMachine } from "./configs/green-flying-enemy.config";
import { createOrangeFlyingEnemyStateMachine } from "./configs/orange-flying-enemy.config";
import { createPurpleFlyingEnemyStateMachine } from "./configs/purple-flying-enemy.config";
import { createRedFlyingEnemyStateMachine } from "./configs/red-flying-enemy.config";

type FlyingEnemyContext = {
  engine: Engine;
  enemy: Enemy;
  player: Player;
};

export type FlyingEnemyContextWithMachine = FlyingEnemyContext & {
  stateMachine: FlyingEnemyStateMachine;
};

type FlyingEnemyState = FLYING_ENEMY_EVENTS;

const StatePredicates = {
  isIdle: (state: FlyingEnemyState): boolean =>
    state === FLYING_ENEMY_EVENTS.IDLE,

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
    state !== FLYING_ENEMY_EVENTS.EXPLODE && state !== FLYING_ENEMY_EVENTS.IDLE,
};

class FlyingEnemyStateMachine extends StateMachine<FlyingEnemyContextWithMachine> {
  public isIdle = (): boolean =>
    StatePredicates.isIdle(this.getState() as FlyingEnemyState);

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

export function createFlyingEnemyStateMachine(
  context: FlyingEnemyContext
): FlyingEnemyStateMachine {
  const ctx = { ...context } as FlyingEnemyContextWithMachine;

  let config: StateMachineConfig<FlyingEnemyContextWithMachine>;

  switch (ctx.enemy.behavior) {
    case FLYING_ENEMY_SPRITES.PURPLE:
      config = createPurpleFlyingEnemyStateMachine();
      break;
    case FLYING_ENEMY_SPRITES.RED:
      config = createRedFlyingEnemyStateMachine();
      break;
    case FLYING_ENEMY_SPRITES.BLUE:
      config = createBlueFlyingEnemyStateMachine();
      break;
    case FLYING_ENEMY_SPRITES.GREEN:
      config = createGreenFlyingEnemyStateMachine();
      break;
    case FLYING_ENEMY_SPRITES.BLACK:
      config = createBlackFlyingEnemyStateMachine();
      break;
    case FLYING_ENEMY_SPRITES.ORANGE:
    default:
      config = createOrangeFlyingEnemyStateMachine();
      break;
  }

  const stateMachine = new FlyingEnemyStateMachine(config, ctx);
  ctx.stateMachine = stateMachine;

  return stateMachine;
}

export type { FlyingEnemyStateMachine, FlyingEnemyContext };
export { StatePredicates };
