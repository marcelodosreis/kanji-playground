import type { Engine } from "../../../../types/engine.interface";
import type { Enemy } from "../../../../types/enemy.interface";
import type { Player } from "../../../../types/player.interface";
import type { FlyingEnemyStateMachine } from "./flying-enemy-state-machine";
import { FLYING_ENEMY_EVENTS } from "../../../../types/events.enum";

type Params = {
  engine: Engine;
  enemy: Enemy;
  player: Player;
  stateMachine: FlyingEnemyStateMachine;
};

export function FlyingEnemyPatrolSystem({ engine, enemy, player, stateMachine }: Params) {
  engine.onUpdate(() => {
    if (enemy.hp() <= 0) return;

    const currentState = stateMachine.getState();
    const isPlayerInRange = enemy.pos.dist(player.pos) < enemy.range;

    if (currentState === FLYING_ENEMY_EVENTS.PATROL_RIGHT) {
      if (isPlayerInRange) {
        stateMachine.dispatch(FLYING_ENEMY_EVENTS.ALERT);
        return;
      }

      enemy.flipX = false;
      enemy.move(enemy.speed, 0);
    }

    if (currentState === FLYING_ENEMY_EVENTS.PATROL_LEFT) {
      if (isPlayerInRange) {
        stateMachine.dispatch(FLYING_ENEMY_EVENTS.ALERT);
        return;
      }

      enemy.flipX = true;
      enemy.move(-enemy.speed, 0);
    }
  });
}