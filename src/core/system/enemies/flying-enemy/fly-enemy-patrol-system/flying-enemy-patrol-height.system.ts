import type { Engine } from "../../../../../types/engine.type";
import type { Enemy } from "../../../../../types/enemy.interface";
import type { FlyingEnemyStateMachine } from "../flying-enemy-state-machine";
import { FLYING_ENEMY_EVENTS } from "../../../../../types/events.enum";
import { isPaused } from "../../../../../utils/is-paused";
import type { FlyingEnemyMovementSystem } from "../flying-enemy-movement";

type PatrolHeightParams = {
  engine: Engine;
  enemy: Enemy;
  stateMachine: FlyingEnemyStateMachine;
  movement: ReturnType<typeof FlyingEnemyMovementSystem>;
};

export function FlyingEnemyPatrolHeightSystem({
  engine,
  enemy,
  stateMachine,
  movement,
}: PatrolHeightParams) {
  const initialY = enemy.pos.y;

  function isPatrolling(): boolean {
    const state = stateMachine.getState();
    return (
      state === FLYING_ENEMY_EVENTS.PATROL_RIGHT ||
      state === FLYING_ENEMY_EVENTS.PATROL_LEFT
    );
  }

  engine.onUpdate(() => {
    if (enemy.hp() <= 0 || isPaused()) return;
    if (!isPatrolling()) return;

    movement.returnToHeight(initialY);
  });
}
