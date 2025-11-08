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

const RETURN_THRESHOLD = 20;
const POSITION_RESET_DISTANCE = 400;

export function FlyingEnemyReturnSystem({
  engine,
  enemy,
  player,
  stateMachine,
}: Params) {
  engine.onUpdate(() => {
    if (!stateMachine.isReturning() || isPaused()) return;

    if (enemy.hp() <= 0) return;

    const distanceToPlayer = enemy.pos.dist(player.pos);
    const distancePlayerFromInitial = player.pos.dist(enemy.initialPos);
    const canReachPlayer =
      distancePlayerFromInitial <= enemy.maxPursuitDistance &&
      distanceToPlayer < enemy.range;

    if (canReachPlayer) {
      stateMachine.dispatch(FLYING_ENEMY_EVENTS.ALERT);
      return;
    }

    const isAtInitialPosition =
      enemy.pos.dist(enemy.initialPos) < RETURN_THRESHOLD;

    if (isAtInitialPosition) {
      stateMachine.dispatch(FLYING_ENEMY_EVENTS.PATROL_RIGHT);
      return;
    }

    enemy.flipX = enemy.initialPos.x <= enemy.pos.x;
    enemy.moveTo(enemy.initialPos, enemy.speed);
  });

  function onExitScreen(): void {
    if (enemy.pos.dist(enemy.initialPos) > POSITION_RESET_DISTANCE) {
      enemy.pos.x = enemy.initialPos.x;
      enemy.pos.y = enemy.initialPos.y;
    }
  }

  enemy.onExitScreen(onExitScreen);
}
