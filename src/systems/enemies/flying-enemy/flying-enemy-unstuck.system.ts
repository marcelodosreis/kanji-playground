import type { Engine } from "../../../types/engine.type";
import type { Enemy } from "../../../types/enemy.interface";
import type { FlyingEnemyStateMachine } from "./fly-enemy-state-machine";
import { isPaused } from "../../../utils/is-paused";
import type { FlyingEnemyDetectionSystem } from "./flying-enemy-detection.system";
import type { FlyingEnemyOrganicMovementSystem } from "./flying-enemy-organic-movement.system";

type UnstuckParams = {
  engine: Engine;
  enemy: Enemy;
  stateMachine: FlyingEnemyStateMachine;
  detection: ReturnType<typeof FlyingEnemyDetectionSystem>;
  organicMovement: ReturnType<typeof FlyingEnemyOrganicMovementSystem>;
};

const STUCK_CHECK_DURATION = 1_000;
const POSITION_TOLERANCE = 10;
const UNSTUCK_SPEED = 80;

export function FlyingEnemyUnstuckSystem({
  engine,
  enemy,
  detection,
  stateMachine,
  organicMovement,
}: UnstuckParams) {
  let stuckCheckStartTime = 0;
  let lastCheckedX = 0;
  let isUnstucking = false;

  function shouldResetUnstuckState(): boolean {
    return (
      detection.hasReachedInitialPosition(POSITION_TOLERANCE) ||
      !stateMachine.isReturning() ||
      isPaused() ||
      enemy.hp() <= 0
    );
  }

  function resetUnstuckState(): void {
    stuckCheckStartTime = 0;
    isUnstucking = false;
  }

  function initializeStuckCheck(): void {
    stuckCheckStartTime = performance.now();
    lastCheckedX = enemy.pos.x;
  }

  function checkIfStuck(): void {
    const now = performance.now();

    if (now - stuckCheckStartTime >= STUCK_CHECK_DURATION) {
      const hasMovedEnough =
        Math.abs(enemy.pos.x - lastCheckedX) > POSITION_TOLERANCE;

      if (!hasMovedEnough) {
        isUnstucking = true;
      }

      stuckCheckStartTime = now;
      lastCheckedX = enemy.pos.x;
    }
  }

  function applyUnstuckMovement(): void {
    if (!isUnstucking) return;

    const currentVel = organicMovement.getCurrentVelocity();
    organicMovement.setTargetVelocity(currentVel.x, -UNSTUCK_SPEED);

    const hasMovedEnough =
      Math.abs(enemy.pos.x - lastCheckedX) > POSITION_TOLERANCE;
    if (hasMovedEnough) {
      isUnstucking = false;
    }
  }

  engine.onUpdate(() => {
    if (shouldResetUnstuckState()) {
      resetUnstuckState();
      return;
    }

    if (stuckCheckStartTime === 0) {
      initializeStuckCheck();
      return;
    }

    checkIfStuck();
    applyUnstuckMovement();
  });
}