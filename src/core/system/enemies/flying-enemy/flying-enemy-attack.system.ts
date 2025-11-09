import type { Engine } from "../../../../types/engine.type";
import type { Enemy } from "../../../../types/enemy.interface";
import type { Player } from "../../../../types/player.interface";
import type { FlyingEnemyStateMachine } from "./flying-enemy-state-machine";
import { FLYING_ENEMY_EVENTS } from "../../../../types/events.enum";
import { isPaused } from "../../../../utils/is-paused";

type Params = {
  engine: Engine;
  enemy: Enemy;
  player: Player;
  stateMachine: FlyingEnemyStateMachine;
};

const MAX_ATTACK_DURATION_SECONDS = 2;
const PLAYER_VERTICAL_OFFSET = 12;

export function FlyingEnemyAttackSystem({
  engine,
  enemy,
  player,
  stateMachine,
}: Params) {
  let attackTimer = 0;

  function resetAttackTimer(): void {
    attackTimer = 0;
  }

  function shouldStopAttacking(): boolean {
    return !stateMachine.isAttacking() || isPaused();
  }

  function canContinueAttack(): boolean {
    return enemy.hp() > 0 && !enemy.isKnockedBack;
  }

  function hasAttackTimedOut(): boolean {
    return attackTimer >= MAX_ATTACK_DURATION_SECONDS;
  }

  function isFarFromInitialPosition(): boolean {
    return enemy.pos.dist(enemy.initialPos) > enemy.patrolDistance;
  }

  function hasPursuitLimitExceeded(): boolean {
    const maxDistanceFromHome = enemy.maxPursuitDistance + enemy.patrolDistance;
    return enemy.pos.dist(enemy.initialPos) > maxDistanceFromHome;
  }

  function returnToInitialPosition(): void {
    resetAttackTimer();
    stateMachine.dispatch(FLYING_ENEMY_EVENTS.RETURN);
  }

  function facePlayer(): void {
    enemy.flipX = player.pos.x <= enemy.pos.x;
  }

  function getPlayerTargetPosition() {
    return engine.vec2(player.pos.x, player.pos.y + PLAYER_VERTICAL_OFFSET);
  }

  function pursuePlayer(): void {
    facePlayer();
    enemy.moveTo(getPlayerTargetPosition(), enemy.pursuitSpeed);
  }

  engine.onUpdate(() => {
    if (shouldStopAttacking()) {
      resetAttackTimer();
      return;
    }

    attackTimer += engine.dt();

    if (hasAttackTimedOut()) {
      if (isFarFromInitialPosition()) {
        returnToInitialPosition();
      } else {
        resetAttackTimer();
      }
      return;
    }

    if (!canContinueAttack()) return;

    if (hasPursuitLimitExceeded()) {
      returnToInitialPosition();
      return;
    }

    pursuePlayer();
  });
}
