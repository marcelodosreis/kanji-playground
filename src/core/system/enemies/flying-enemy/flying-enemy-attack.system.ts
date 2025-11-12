import type {
  CollidersEngineGameObj,
  Engine,
} from "../../../../types/engine.type";
import type { Enemy } from "../../../../types/enemy.interface";
import type { Player } from "../../../../types/player.interface";
import type { FlyingEnemyStateMachine } from "./flying-enemy-state-machine";
import { FLYING_ENEMY_EVENTS } from "../../../../types/events.enum";
import { isPaused } from "../../../../utils/is-paused";
import type { FlyingEnemyMovementSystem } from "./flying-enemy-movement";
import type { FlyingEnemyDetectionSystem } from "./flying-enemy-detection";
import { hasObstacleBetweenObjects } from "../../../../utils/raycast";

type AttackParams = {
  engine: Engine;
  enemy: Enemy;
  player: Player;
  colliders: CollidersEngineGameObj[];
  stateMachine: FlyingEnemyStateMachine;
  movement: ReturnType<typeof FlyingEnemyMovementSystem>;
  detection: ReturnType<typeof FlyingEnemyDetectionSystem>;
};

export function FlyingEnemyAttackSystem({
  engine,
  enemy,
  player,
  colliders,
  stateMachine,
  movement,
  detection,
}: AttackParams) {
  const PLAYER_VERTICAL_OFFSET = 12;
  const MIN_ATTACK_DURATION = 1_000;
  let attackStartTime = 0;

  function startAttackTimer(): void {
    if (attackStartTime === 0) attackStartTime = performance.now();
  }

  function hasAttackDurationPassed(): boolean {
    return performance.now() - attackStartTime >= MIN_ATTACK_DURATION;
  }

  function shouldStopAttacking(): boolean {
    return (
      !stateMachine.isAttacking() ||
      isPaused() ||
      enemy.hp() <= 0 ||
      enemy.isKnockedBack
    );
  }

  function returnToInitialPosition(): void {
    stateMachine.dispatch(FLYING_ENEMY_EVENTS.RETURN);
  }

  function getPlayerTargetPosition() {
    return {
      x: player.pos.x,
      y: player.pos.y + PLAYER_VERTICAL_OFFSET,
    };
  }

  function pursuePlayer(): void {
    const target = getPlayerTargetPosition();
    movement.moveToPosition(target.x, target.y, enemy.pursuitSpeed);
  }

  function handleObstacles(): boolean {
    if (!hasAttackDurationPassed()) return false;
    if (
      hasObstacleBetweenObjects({ origin: enemy, target: player, colliders })
    ) {
      returnToInitialPosition();
      return true;
    }
    return false;
  }

  function handlePursuitLimit(): boolean {
    if (detection.hasPursuitLimitExceeded()) {
      returnToInitialPosition();
      return true;
    }
    return false;
  }

  engine.onUpdate(() => {
    if (stateMachine.isAttacking()) startAttackTimer();
    else attackStartTime = 0;

    if (shouldStopAttacking()) return;
    if (handleObstacles()) return;
    if (handlePursuitLimit()) return;

    pursuePlayer();
  });
}
