import type { Engine } from "../../../../types/engine.type";
import type { Enemy } from "../../../../types/enemy.interface";
import type { Player } from "../../../../types/player.interface";
import type { FlyingEnemyStateMachine } from "./flying-enemy-state-machine";
import { FLYING_ENEMY_EVENTS } from "../../../../types/events.enum";
import { isPaused } from "../../../../utils/is-paused";
import { FLYING_ENEMY_SPRITES } from "../../../../types/sprites.enum";

type Params = {
  engine: Engine;
  enemy: Enemy;
  player: Player;
  stateMachine: FlyingEnemyStateMachine;
};

export function FlyingEnemyPatrolSystem({
  engine,
  enemy,
  player,
  stateMachine,
}: Params) {
  const initialX = enemy.pos.x;
  const initialY = enemy.pos.y;

  engine.onUpdate(() => {
    if (enemy.hp() <= 0 || isPaused()) return;

    const currentState = stateMachine.getState();
    const isPlayerInRange = enemy.pos.dist(player.pos) < enemy.range;
    const behavior = enemy.behavior;
    const shouldReactToPlayer = behavior !== FLYING_ENEMY_SPRITES.ORANGE;

    if (
      currentState === FLYING_ENEMY_EVENTS.PATROL_RIGHT ||
      currentState === FLYING_ENEMY_EVENTS.PATROL_LEFT
    ) {
      enemy.pos.y = initialY;
    }

    if (currentState === FLYING_ENEMY_EVENTS.PATROL_RIGHT) {
      if (isPlayerInRange && shouldReactToPlayer) {
        stateMachine.dispatch(FLYING_ENEMY_EVENTS.ALERT);
        return;
      }

      enemy.flipX = false;
      enemy.move(enemy.speed, 0);

      if (enemy.pos.x >= initialX + enemy.patrolDistance) {
        stateMachine.dispatch(FLYING_ENEMY_EVENTS.PATROL_LEFT);
      }
    }

    if (currentState === FLYING_ENEMY_EVENTS.PATROL_LEFT) {
      if (isPlayerInRange && shouldReactToPlayer) {
        stateMachine.dispatch(FLYING_ENEMY_EVENTS.ALERT);
        return;
      }

      enemy.flipX = true;
      enemy.move(-enemy.speed, 0);

      if (enemy.pos.x <= initialX - enemy.patrolDistance) {
        stateMachine.dispatch(FLYING_ENEMY_EVENTS.PATROL_RIGHT);
      }
    }
  });
}
