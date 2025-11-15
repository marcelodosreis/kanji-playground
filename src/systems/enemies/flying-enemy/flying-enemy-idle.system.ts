import type { Engine } from "../../../types/engine.type";
import type { Enemy } from "../../../types/enemy.interface";
import type { FlyingEnemyStateMachine } from "./fly-enemy-state-machine";
import { FLYING_ENEMY_EVENTS } from "../../../types/events.enum";
import { isPaused } from "../../../utils/is-paused";
import type { FlyingEnemyMovementSystem } from "./flying-enemy-movement.system";
import type { FlyingEnemyDetectionSystem } from "./flying-enemy-detection.system";

type IdleParams = {
  engine: Engine;
  enemy: Enemy;
  stateMachine: FlyingEnemyStateMachine;
  movement: ReturnType<typeof FlyingEnemyMovementSystem>;
  detection: ReturnType<typeof FlyingEnemyDetectionSystem>;
};

export function FlyingEnemyIdleSystem({
  engine,
  enemy,
  stateMachine,
  movement,
  detection,
}: IdleParams) {
  const initialY = enemy.pos.y;

  function shouldStopIdle(): boolean {
    return !stateMachine.isIdle() || isPaused() || enemy.hp() <= 0;
  }

  function tryAlertPlayer(): boolean {
    if (!detection.isPlayerWithinCurrentRange()) return false;
    stateMachine.dispatch(FLYING_ENEMY_EVENTS.ALERT);
    return true;
  }

  function maintainHeight(): void {
    movement.returnToHeight(initialY);
  }

  engine.onUpdate(() => {
    if (shouldStopIdle()) return;
    if (tryAlertPlayer()) return;

    maintainHeight();
  });
}
