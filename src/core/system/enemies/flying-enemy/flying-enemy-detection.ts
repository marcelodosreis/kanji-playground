import type { Enemy } from "../../../../types/enemy.interface";
import type { Player } from "../../../../types/player.interface";

type DetectionParams = {
  enemy: Enemy;
  player: Player;
};

export function FlyingEnemyDetectionSystem({ enemy, player }: DetectionParams) {
  function getDistanceToPlayer(): number {
    return enemy.pos.dist(player.pos);
  }

  function getDistanceToInitialPos(): number {
    return enemy.pos.dist(enemy.initialPos);
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

  function isPlayerInRange(): boolean {
    return getDistanceToPlayer() < enemy.range;
  }

  function isPlayerInAttackRange(): boolean {
    const attackRangeSq = enemy.range * enemy.range;
    const distSq = getSquaredDistance(
      enemy.pos.x,
      enemy.pos.y,
      player.pos.x,
      player.pos.y
    );
    return distSq < attackRangeSq;
  }

  function isWithinPursuitLimit(): boolean {
    return getDistanceToInitialPos() <= enemy.maxPursuitDistance;
  }

  function isPlayerWithinPursuitRange(): boolean {
    const maxPursuitDistanceSq =
      enemy.maxPursuitDistance * enemy.maxPursuitDistance;
    const distSq = getSquaredDistance(
      player.pos.x,
      player.pos.y,
      enemy.initialPos.x,
      enemy.initialPos.y
    );
    return distSq <= maxPursuitDistanceSq;
  }

  function isFarFromInitialPosition(): boolean {
    return getDistanceToInitialPos() > enemy.patrolDistance;
  }

  function hasPursuitLimitExceeded(): boolean {
    const maxDistance = enemy.maxPursuitDistance + enemy.patrolDistance;
    return getDistanceToInitialPos() > maxDistance;
  }

  function hasReachedInitialPosition(threshold: number): boolean {
    const thresholdSq = threshold * threshold;
    const distSq = getSquaredDistance(
      enemy.pos.x,
      enemy.pos.y,
      enemy.initialPos.x,
      enemy.initialPos.y
    );
    return distSq < thresholdSq;
  }

  function isTooFarFromHome(maxDistance: number): boolean {
    const maxDistanceSq = maxDistance * maxDistance;
    const distSq = getSquaredDistance(
      enemy.pos.x,
      enemy.pos.y,
      enemy.initialPos.x,
      enemy.initialPos.y
    );
    return distSq > maxDistanceSq;
  }

  return {
    getDistanceToPlayer,
    getDistanceToInitialPos,
    isPlayerInRange,
    isPlayerInAttackRange,
    isWithinPursuitLimit,
    isPlayerWithinPursuitRange,
    isFarFromInitialPosition,
    hasPursuitLimitExceeded,
    hasReachedInitialPosition,
    isTooFarFromHome,
  };
}
