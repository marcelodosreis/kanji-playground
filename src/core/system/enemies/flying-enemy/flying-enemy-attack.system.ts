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

export function FlyingEnemyAttackSystem({ engine, enemy, player, stateMachine }: Params) {
  engine.onUpdate(() => {
    if (!stateMachine.isAttacking()) return;

    if (enemy.hp() <= 0 || enemy.isKnockedBack) return;

    const isBeyondPursuitLimit = enemy.pos.dist(enemy.initialPos) > enemy.maxPursuitDistance;
    const isPlayerInRange = enemy.pos.dist(player.pos) < enemy.range;

    if (isBeyondPursuitLimit || !isPlayerInRange) {
      stateMachine.dispatch(FLYING_ENEMY_EVENTS.RETURN);
      return;
    }

    enemy.flipX = player.pos.x <= enemy.pos.x;
    enemy.moveTo(
      engine.vec2(player.pos.x, player.pos.y + 12),
      enemy.pursuitSpeed
    );
  });
}