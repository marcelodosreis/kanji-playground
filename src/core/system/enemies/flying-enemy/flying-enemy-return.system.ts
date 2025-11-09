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

const RETURN_THRESHOLD_DISTANCE = 20;
const TELEPORT_RESET_DISTANCE = 400;

export function FlyingEnemyReturnSystem({
  engine,
  enemy,
  player,
  stateMachine,
}: Params) {
  function shouldStopReturning(): boolean {
    return !stateMachine.isReturning() || isPaused() || enemy.hp() <= 0;
  }

  function getSquaredDistance(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return dx * dx + dy * dy;
  }

  function getDistanceToPlayer(): number {
    return getSquaredDistance(
      enemy.pos.x,
      enemy.pos.y,
      player.pos.x,
      player.pos.y
    );
  }

  function getPlayerDistanceFromInitialPosition(): number {
    return getSquaredDistance(
      player.pos.x,
      player.pos.y,
      enemy.initialPos.x,
      enemy.initialPos.y
    );
  }

  function getDistanceToInitialPosition(): number {
    return getSquaredDistance(
      enemy.pos.x,
      enemy.pos.y,
      enemy.initialPos.x,
      enemy.initialPos.y
    );
  }

  function isPlayerWithinPursuitRange(): boolean {
    const maxPursuitDistanceSq =
      enemy.maxPursuitDistance * enemy.maxPursuitDistance;
    return getPlayerDistanceFromInitialPosition() <= maxPursuitDistanceSq;
  }

  function isPlayerInAttackRange(): boolean {
    const attackRangeSq = enemy.range * enemy.range;
    return getDistanceToPlayer() < attackRangeSq;
  }

  function canReEngagePlayer(): boolean {
    return isPlayerWithinPursuitRange() && isPlayerInAttackRange();
  }

  function hasReachedInitialPosition(): boolean {
    const thresholdSq = RETURN_THRESHOLD_DISTANCE * RETURN_THRESHOLD_DISTANCE;
    return getDistanceToInitialPosition() < thresholdSq;
  }

  function alertAndPursuePlayer(): void {
    stateMachine.dispatch(FLYING_ENEMY_EVENTS.ALERT);
  }

  function resumePatrol(): void {
    stateMachine.dispatch(FLYING_ENEMY_EVENTS.PATROL_RIGHT);
  }

  function faceInitialPosition(): void {
    enemy.flipX = enemy.initialPos.x <= enemy.pos.x;
  }

  function moveTowardsInitialPosition(): void {
    faceInitialPosition();
    enemy.moveTo(enemy.initialPos, enemy.speed);
  }

  function isTooFarFromHome(): boolean {
    const maxDistanceSq = TELEPORT_RESET_DISTANCE * TELEPORT_RESET_DISTANCE;
    return getDistanceToInitialPosition() > maxDistanceSq;
  }

  function teleportToInitialPosition(): void {
    enemy.pos.x = enemy.initialPos.x;
    enemy.pos.y = enemy.initialPos.y;
  }

  function handleExitScreen(): void {
    if (isTooFarFromHome()) {
      teleportToInitialPosition();
    }
  }

  engine.onUpdate(() => {
    if (shouldStopReturning()) return;

    if (canReEngagePlayer()) {
      alertAndPursuePlayer();
      return;
    }

    if (hasReachedInitialPosition()) {
      resumePatrol();
      return;
    }

    moveTowardsInitialPosition();
  });

  enemy.onExitScreen(handleExitScreen);
}
