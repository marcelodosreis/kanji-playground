import type { Enemy } from "../../../../types/enemy.interface";
import type { CollidersEngineGameObj } from "../../../../types/engine.type";
import type { Player } from "../../../../types/player.interface";
import { hasObstacleBetweenObjects } from "../../../../utils/raycast";

type DetectionParams = {
  enemy: Enemy;
  player: Player;
  colliders: CollidersEngineGameObj[];
};

export function FlyingEnemyDetectionSystem({
  enemy,
  player,
  colliders,
}: DetectionParams) {
  function getDistanceToPlayer(): number {
    return enemy.pos.dist(player.pos);
  }

  function getDistanceToInitialPos(): number {
    return enemy.pos.dist(enemy.initialPos);
  }

  function getSquaredDistance(x1: number, y1: number, x2: number, y2: number) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return dx * dx + dy * dy;
  }

  function isPlayerWithinCurrentRange(): boolean {
    if (
      hasObstacleBetweenObjects({ origin: enemy, target: player, colliders })
    ) {
      return false;
    }

    const attackRangeSq = enemy.range * enemy.range;
    const distSq = getSquaredDistance(
      enemy.pos.x,
      enemy.pos.y,
      player.pos.x,
      player.pos.y
    );
    return distSq <= attackRangeSq;
  }

  function isWithinCurrentPursuitLimit(): boolean {
    const maxPursuitDistanceSq =
      enemy.maxPursuitDistance * enemy.maxPursuitDistance;
    const distSq = getSquaredDistance(
      enemy.pos.x,
      enemy.pos.y,
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
    isPlayerWithinCurrentRange,
    isWithinCurrentPursuitLimit,
    isFarFromInitialPosition,
    hasPursuitLimitExceeded,
    hasReachedInitialPosition,
    isTooFarFromHome,
  };
}
