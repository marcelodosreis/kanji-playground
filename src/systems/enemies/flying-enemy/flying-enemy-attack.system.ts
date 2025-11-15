import type {
  CollidersEngineGameObj,
  Engine,
} from "../../../types/engine.type";
import type { Enemy } from "../../../types/enemy.interface";
import type { Player } from "../../../types/player.interface";
import type { FlyingEnemyStateMachine } from "./fly-enemy-state-machine-system";
import { FLYING_ENEMY_EVENTS } from "../../../types/events.enum";
import { isPaused } from "../../../utils/is-paused";
import type { FlyingEnemyMovementSystem } from "./flying-enemy-movement.system";
import type { FlyingEnemyDetectionSystem } from "./flying-enemy-detection.system";
import { hasObstacleBetweenObjects } from "../../../utils/raycast";
import { FLYING_ENEMY_SPRITES } from "../../../types/sprites.enum";

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
  const MIN_ATTACK_DURATION = 1.0;
  let attackTimer = 0;

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
    attackTimer = 0;
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
    if (attackTimer < MIN_ATTACK_DURATION) return false;

    if (
      hasObstacleBetweenObjects({ origin: enemy, target: player, colliders })
    ) {
      returnToInitialPosition();
      return true;
    }
    return false;
  }

  function handlePursuitLimit(): boolean {
    if (enemy.behavior === FLYING_ENEMY_SPRITES.RED) {
      return false;
    }

    if (detection.hasPursuitLimitExceeded()) {
      returnToInitialPosition();
      return true;
    }
    return false;
  }

  engine.onUpdate(() => {
    if (shouldStopAttacking()) {
      attackTimer = 0;
      return;
    }

    attackTimer += engine.dt();

    if (handleObstacles()) return;
    if (handlePursuitLimit()) return;

    pursuePlayer();
  });
}
