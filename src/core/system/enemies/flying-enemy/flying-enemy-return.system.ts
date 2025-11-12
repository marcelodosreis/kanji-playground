import type { Engine } from "../../../../types/engine.type";
import type { Enemy } from "../../../../types/enemy.interface";
import type { FlyingEnemyStateMachine } from "./flying-enemy-state-machine";
import { FLYING_ENEMY_EVENTS } from "../../../../types/events.enum";
import { isPaused } from "../../../../utils/is-paused";
import type { FlyingEnemyMovementSystem } from "./flying-enemy-movement";
import type { FlyingEnemyDetectionSystem } from "./flying-enemy-detection";

type ReturnParams = {
  engine: Engine;
  enemy: Enemy;
  stateMachine: FlyingEnemyStateMachine;
  movement: ReturnType<typeof FlyingEnemyMovementSystem>;
  detection: ReturnType<typeof FlyingEnemyDetectionSystem>;
};

const RETURN_THRESHOLD_DISTANCE = 5;
const TELEPORT_RESET_DISTANCE = 400;

export function FlyingEnemyReturnSystem({
  engine,
  enemy,
  stateMachine,
  movement,
  detection,
}: ReturnParams) {
  function shouldStopReturning(): boolean {
    return !stateMachine.isReturning() || isPaused() || enemy.hp() <= 0;
  }

  function canReEngagePlayer(): boolean {
    return (
      detection.isPlayerWithinCurrentRange() &&
      detection.isWithinCurrentPursuitLimit()
    );
  }

  function alertAndPursuePlayer(): void {
    stateMachine.dispatch(FLYING_ENEMY_EVENTS.ALERT);
  }

  function resumePatrol(): void {
    stateMachine.dispatch(FLYING_ENEMY_EVENTS.PATROL_RIGHT);
  }

  function moveTowardsInitialPosition(): void {
    movement.moveToPosition(
      enemy.initialPos.x,
      enemy.initialPos.y,
      enemy.speed
    );
  }

  function teleportToInitialPosition(): void {
    enemy.pos.x = enemy.initialPos.x;
    enemy.pos.y = enemy.initialPos.y;
  }

  function handleExitScreen(): void {
    if (detection.isTooFarFromHome(TELEPORT_RESET_DISTANCE)) {
      teleportToInitialPosition();
    }
  }

  engine.onUpdate(() => {
    if (shouldStopReturning()) return;

    if (canReEngagePlayer()) {
      alertAndPursuePlayer();
      return;
    }

    if (detection.hasReachedInitialPosition(RETURN_THRESHOLD_DISTANCE)) {
      resumePatrol();
      return;
    }

    moveTowardsInitialPosition();
  });

  enemy.onExitScreen(handleExitScreen);
}
