import type { Engine } from "../../../../types/engine.type";
import type { Enemy } from "../../../../types/enemy.interface";
import type { Player } from "../../../../types/player.interface";
import type { FlyingEnemyStateMachine } from "./flying-enemy-state-machine";
import { FLYING_ENEMY_EVENTS } from "../../../../types/events.enum";
import { isPaused } from "../../../../utils/is-paused";
import type { FlyingEnemyMovementSystem } from "./flying-enemy-movement";
import type { FlyingEnemyDetectionSystem } from "./flying-enemy-detection";

type AttackParams = {
  engine: Engine;
  enemy: Enemy;
  player: Player;
  stateMachine: FlyingEnemyStateMachine;
  movement: ReturnType<typeof FlyingEnemyMovementSystem>;
  detection: ReturnType<typeof FlyingEnemyDetectionSystem>;
};

const PLAYER_VERTICAL_OFFSET = 12;

export function FlyingEnemyAttackSystem({
  engine,
  enemy,
  player,
  stateMachine,
  movement,
  detection,
}: AttackParams) {

  function shouldStopAttacking(): boolean {
    return !stateMachine.isAttacking() || isPaused();
  }

  function canContinueAttack(): boolean {
    return enemy.hp() > 0 && !enemy.isKnockedBack;
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

  function handlePursuitLimit(): boolean {
    if (!detection.hasPursuitLimitExceeded()) return false;
    returnToInitialPosition();
    return true;
  }

  engine.onUpdate(() => {
    if (shouldStopAttacking()) return;
    if (!canContinueAttack()) return;
    if (handlePursuitLimit()) return;

    pursuePlayer();
  });
}
