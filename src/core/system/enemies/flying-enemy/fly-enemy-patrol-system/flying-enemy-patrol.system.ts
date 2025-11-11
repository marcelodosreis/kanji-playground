import type { Engine } from "../../../../../types/engine.type";
import type { Enemy } from "../../../../../types/enemy.interface";
import type { FlyingEnemyStateMachine } from "../flying-enemy-state-machine";
import { FLYING_ENEMY_EVENTS } from "../../../../../types/events.enum";
import { isPaused } from "../../../../../utils/is-paused";
import { FLYING_ENEMY_SPRITES } from "../../../../../types/sprites.enum";
import type { FlyingEnemyMovementSystem } from "../flying-enemy-movement";
import type { FlyingEnemyDetectionSystem } from "../flying-enemy-detection";
import type { FlyingEnemyPatrolDirectionSystem } from "./flying-enemy-patrol-direction";

type PatrolParams = {
  engine: Engine;
  enemy: Enemy;
  stateMachine: FlyingEnemyStateMachine;
  movement: ReturnType<typeof FlyingEnemyMovementSystem>;
  detection: ReturnType<typeof FlyingEnemyDetectionSystem>;
  patrolDirection: ReturnType<typeof FlyingEnemyPatrolDirectionSystem>;
};

export function FlyingEnemyPatrolSystem({
  engine,
  enemy,
  stateMachine,
  movement,
  detection,
  patrolDirection,
}: PatrolParams) {
  function shouldStopPatrolling(): boolean {
    return enemy.hp() <= 0 || isPaused();
  }

  function shouldReactToPlayer(): boolean {
    return enemy.behavior !== FLYING_ENEMY_SPRITES.ORANGE;
  }

  function isPatrolling(): boolean {
    const state = stateMachine.getState();
    return (
      state === FLYING_ENEMY_EVENTS.PATROL_RIGHT ||
      state === FLYING_ENEMY_EVENTS.PATROL_LEFT
    );
  }

  function tryAlertPlayer(): boolean {
    if (!isPatrolling()) return false;
    if (!detection.isPlayerInRange()) return false;
    if (!shouldReactToPlayer()) return false;

    stateMachine.dispatch(FLYING_ENEMY_EVENTS.ALERT);
    return true;
  }

  function patrol(): void {
    if (!isPatrolling()) return;

    if (patrolDirection.shouldChangeDirection()) {
      patrolDirection.changeDirection();
      return;
    }

    const direction = patrolDirection.getPatrolDirection();
    movement.moveHorizontal(direction);
  }

  engine.onUpdate(() => {
    if (shouldStopPatrolling()) return;
    if (tryAlertPlayer()) return;

    patrol();
  });
}