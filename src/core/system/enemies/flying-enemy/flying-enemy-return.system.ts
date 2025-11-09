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

const RETURN_THRESHOLD_SQ = 20 * 20;
const POSITION_RESET_DISTANCE_SQ = 400 * 400;
const STUCK_CHECK_DURATION = 3;
const POSITION_TOLERANCE = 5;
const UNSTUCK_SPEED = 50;

export function FlyingEnemyReturnSystem({
  engine,
  enemy,
  player,
  stateMachine,
}: Params) {
  let stuckCheckStartTime = 0;
  let lastCheckedX = 0;
  let isUnstucking = false;

  engine.onUpdate(() => {
    if (!stateMachine.isReturning() || isPaused()) {
      stuckCheckStartTime = 0;
      isUnstucking = false;
      return;
    }

    if (enemy.hp() <= 0) return;

    const enemyPos = enemy.pos;
    const playerPos = player.pos;
    const initialPos = enemy.initialPos;

    const dxEnemyPlayer = enemyPos.x - playerPos.x;
    const dyEnemyPlayer = enemyPos.y - playerPos.y;
    const distanceToPlayerSq =
      dxEnemyPlayer * dxEnemyPlayer + dyEnemyPlayer * dyEnemyPlayer;

    const dxPlayerInitial = playerPos.x - initialPos.x;
    const dyPlayerInitial = playerPos.y - initialPos.y;
    const distancePlayerFromInitialSq =
      dxPlayerInitial * dxPlayerInitial + dyPlayerInitial * dyPlayerInitial;

    const canReachPlayer =
      distancePlayerFromInitialSq <=
        enemy.maxPursuitDistance * enemy.maxPursuitDistance &&
      distanceToPlayerSq < enemy.range * enemy.range;

    if (canReachPlayer) {
      stateMachine.dispatch(FLYING_ENEMY_EVENTS.ALERT);
      stuckCheckStartTime = 0;
      isUnstucking = false;
      return;
    }

    const dxEnemyInitial = enemyPos.x - initialPos.x;
    const dyEnemyInitial = enemyPos.y - initialPos.y;
    const distanceToInitialSq =
      dxEnemyInitial * dxEnemyInitial + dyEnemyInitial * dyEnemyInitial;

    const isAtInitialPosition = distanceToInitialSq < RETURN_THRESHOLD_SQ;

    if (isAtInitialPosition) {
      stateMachine.dispatch(FLYING_ENEMY_EVENTS.PATROL_RIGHT);
      stuckCheckStartTime = 0;
      isUnstucking = false;
      return;
    }

    const now = engine.time();

    if (stuckCheckStartTime === 0) {
      stuckCheckStartTime = now;
      lastCheckedX = enemyPos.x;
    } else if (now - stuckCheckStartTime >= STUCK_CHECK_DURATION) {
      if (Math.abs(enemyPos.x - lastCheckedX) <= POSITION_TOLERANCE) {
        isUnstucking = true;
      }
      stuckCheckStartTime = now;
      lastCheckedX = enemyPos.x;
    }

    if (isUnstucking) {
      enemyPos.y -= UNSTUCK_SPEED * engine.dt();

      if (Math.abs(enemyPos.x - lastCheckedX) > POSITION_TOLERANCE) {
        isUnstucking = false;
      }
    }

    enemy.flipX = initialPos.x <= enemyPos.x;
    enemy.moveTo(initialPos, enemy.speed);
  });

  function onExitScreen(): void {
    const dx = enemy.pos.x - enemy.initialPos.x;
    const dy = enemy.pos.y - enemy.initialPos.y;
    const distSq = dx * dx + dy * dy;

    if (distSq > POSITION_RESET_DISTANCE_SQ) {
      enemy.pos.x = enemy.initialPos.x;
      enemy.pos.y = enemy.initialPos.y;
    }
  }

  enemy.onExitScreen(onExitScreen);
}
