import type { Engine } from "../../../../types/engine.type";
import type { Enemy } from "../../../../types/enemy.interface";
import type { FlyingEnemyStateMachine } from "./flying-enemy-state-machine";
import { isPaused } from "../../../../utils/is-paused";

type Params = {
  engine: Engine;
  enemy: Enemy;
  stateMachine: FlyingEnemyStateMachine;
};

const STUCK_CHECK_DURATION = 1;
const POSITION_TOLERANCE = 5;
const UNSTUCK_SPEED = 50;

export function FlyingEnemyUnstuckSystem({
  engine,
  enemy,
  stateMachine,
}: Params) {
  let stuckCheckStartTime = 0;
  let lastCheckedX = 0;
  let isUnstucking = false;

  engine.onUpdate(() => {
    if (!stateMachine.isReturning() || isPaused()) {
      stuckCheckStartTime = 0;
      isUnstucking = false;
      return;
    }

    if (enemy.hp() <= 0) {
      stuckCheckStartTime = 0;
      isUnstucking = false;
      return;
    }

    const enemyPos = enemy.pos;
    const now = engine.time();

    if (stuckCheckStartTime === 0) {
      stuckCheckStartTime = now;
      lastCheckedX = enemyPos.x;
      return;
    }

    if (now - stuckCheckStartTime >= STUCK_CHECK_DURATION) {
      if (Math.abs(enemyPos.x - lastCheckedX) <= POSITION_TOLERANCE) {
        isUnstucking = true;
      }
      stuckCheckStartTime = now;
      lastCheckedX = enemyPos.x;
    }

    if (isUnstucking) {
      enemyPos.y -= UNSTUCK_SPEED * engine.dt();

      if (Math.abs(enemyPos.x - lastCheckedX) > POSITION_TOLERANCE) {
        isUnstucking = false;
      }
    }
  });
}
