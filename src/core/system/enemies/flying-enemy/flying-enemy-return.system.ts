import type { Engine } from "../../../../types/engine.type";
import type { Enemy } from "../../../../types/enemy.interface";
import type { FlyingEnemyStateMachine } from "./fly-enemy-state-machine-system";
import { FLYING_ENEMY_EVENTS } from "../../../../types/events.enum";
import { isPaused } from "../../../../utils/is-paused";
import type { FlyingEnemyMovementSystem } from "./flying-enemy-movement";
import type { FlyingEnemyDetectionSystem } from "./flying-enemy-detection";
import { FLYING_ENEMY_SPRITES } from "../../../../types/sprites.enum";

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
    if (enemy.behavior === FLYING_ENEMY_SPRITES.GREEN) {
      return false;
    }

    if (enemy.behavior === FLYING_ENEMY_SPRITES.BLACK) {
      return false;
    }

    return (
      detection.isPlayerWithinCurrentRange() &&
      detection.isWithinCurrentPursuitLimit()
    );
  }

  function alertAndPursuePlayer(): void {
    stateMachine.dispatch(FLYING_ENEMY_EVENTS.ALERT);
  }

  function resumeInitialState(): void {
    switch (enemy.behavior) {
      case FLYING_ENEMY_SPRITES.BLUE:
      case FLYING_ENEMY_SPRITES.BLACK:
        stateMachine.dispatch(FLYING_ENEMY_EVENTS.IDLE);
        break;
      case FLYING_ENEMY_SPRITES.GREEN:
      case FLYING_ENEMY_SPRITES.ORANGE:
      case FLYING_ENEMY_SPRITES.PURPLE:
      default:
        stateMachine.dispatch(FLYING_ENEMY_EVENTS.PATROL_RIGHT);
        break;
    }
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
      resumeInitialState();
      return;
    }

    moveTowardsInitialPosition();
  });

  enemy.onExitScreen(handleExitScreen);
}
