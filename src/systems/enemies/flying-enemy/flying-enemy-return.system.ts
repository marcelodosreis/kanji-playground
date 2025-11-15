import type { Engine } from "../../../types/engine.type";
import type { Enemy } from "../../../types/enemy.interface";
import type { FlyingEnemyStateMachine } from "./fly-enemy-state-machine-system";
import { FLYING_ENEMY_EVENTS } from "../../../types/events.enum";
import { isPaused } from "../../../utils/is-paused";
import type { FlyingEnemyMovementSystem } from "./flying-enemy-movement.system";
import type { FlyingEnemyDetectionSystem } from "./flying-enemy-detection.system";
import { FLYING_ENEMY_SPRITES } from "../../../types/sprites.enum";
import type { FlyingEnemyOrganicMovementSystem } from "./flying-enemy-organic-movement.system";

type ReturnParams = {
  engine: Engine;
  enemy: Enemy;
  stateMachine: FlyingEnemyStateMachine;
  movement: ReturnType<typeof FlyingEnemyMovementSystem>;
  detection: ReturnType<typeof FlyingEnemyDetectionSystem>;
  organicMovement: ReturnType<typeof FlyingEnemyOrganicMovementSystem>;
};

const RETURN_THRESHOLD_DISTANCE = 5;
const TELEPORT_RESET_DISTANCE = 400;

export function FlyingEnemyReturnSystem({
  engine,
  enemy,
  stateMachine,
  movement,
  detection,
  organicMovement,
}: ReturnParams) {
  function shouldStopReturning(): boolean {
    return !stateMachine.isReturning() || isPaused() || enemy.hp() <= 0;
  }

  function canReEngagePlayer(): boolean {
    if (enemy.behavior === FLYING_ENEMY_SPRITES.GREEN) {
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
    organicMovement.setTargetVelocity(0, 0);
    
    switch (enemy.behavior) {
      case FLYING_ENEMY_SPRITES.BLUE:
      case FLYING_ENEMY_SPRITES.GREEN:
        stateMachine.dispatch(FLYING_ENEMY_EVENTS.IDLE);
        break;
      case FLYING_ENEMY_SPRITES.ORANGE:
      case FLYING_ENEMY_SPRITES.PURPLE:
      case FLYING_ENEMY_SPRITES.BLACK:

      default:
        stateMachine.dispatch(FLYING_ENEMY_EVENTS.PATROL_RIGHT);
        break;
    }
  }

  function moveTowardsInitialPosition(): void {
    const dx = enemy.initialPos.x - enemy.pos.x;
    const dy = enemy.initialPos.y - enemy.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < RETURN_THRESHOLD_DISTANCE * 2) {
      organicMovement.setTargetVelocity(0, 0);
    } else {
      movement.moveToPosition(
        enemy.initialPos.x,
        enemy.initialPos.y,
        enemy.speed
      );
    }
  }

  function teleportToInitialPosition(): void {
    enemy.pos.x = enemy.initialPos.x;
    enemy.pos.y = enemy.initialPos.y;
    organicMovement.resetVelocity();
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