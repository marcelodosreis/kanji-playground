import type { Enemy } from "../../../../../types/enemy.interface";
import type { FlyingEnemyStateMachine } from "../flying-enemy-state-machine";
import { FLYING_ENEMY_EVENTS } from "../../../../../types/events.enum";

type PatrolDirectionParams = {
  enemy: Enemy;
  stateMachine: FlyingEnemyStateMachine;
};

export function FlyingEnemyPatrolDirectionSystem({
  enemy,
  stateMachine,
}: PatrolDirectionParams) {
  const initialX = enemy.pos.x;
  let lastX = enemy.pos.x;
  let stuckFrames = 0;

  const STUCK_THRESHOLD = 10;
  const MIN_MOVEMENT = 0.5;

  function resetStuckDetection(): void {
    stuckFrames = 0;
    lastX = enemy.pos.x;
  }

  function isStuck(): boolean {
    const movement = Math.abs(enemy.pos.x - lastX);

    if (movement < MIN_MOVEMENT) {
      stuckFrames++;
    } else {
      stuckFrames = 0;
    }

    lastX = enemy.pos.x;
    return stuckFrames >= STUCK_THRESHOLD;
  }

  function isPatrolling(): boolean {
    const state = stateMachine.getState();
    return (
      state === FLYING_ENEMY_EVENTS.PATROL_RIGHT ||
      state === FLYING_ENEMY_EVENTS.PATROL_LEFT
    );
  }

  function shouldChangeDirection(): boolean {
    if (!isPatrolling()) {
      resetStuckDetection();
      return false;
    }

    const currentState = stateMachine.getState();
    const isMovingRight = currentState === FLYING_ENEMY_EVENTS.PATROL_RIGHT;
    const isMovingLeft = currentState === FLYING_ENEMY_EVENTS.PATROL_LEFT;

    if (isMovingRight) {
      return enemy.pos.x >= initialX + enemy.patrolDistance || isStuck();
    }

    if (isMovingLeft) {
      return enemy.pos.x <= initialX - enemy.patrolDistance || isStuck();
    }

    return false;
  }

  function changeDirection(): void {
    resetStuckDetection();
    const currentState = stateMachine.getState();

    if (currentState === FLYING_ENEMY_EVENTS.PATROL_RIGHT) {
      stateMachine.dispatch(FLYING_ENEMY_EVENTS.PATROL_LEFT);
    } else if (currentState === FLYING_ENEMY_EVENTS.PATROL_LEFT) {
      stateMachine.dispatch(FLYING_ENEMY_EVENTS.PATROL_RIGHT);
    }
  }

  function getPatrolDirection(): number {
    const currentState = stateMachine.getState();
    return currentState === FLYING_ENEMY_EVENTS.PATROL_RIGHT ? 1 : -1;
  }

  return {
    shouldChangeDirection,
    changeDirection,
    getPatrolDirection,
    resetStuckDetection,
  };
}
