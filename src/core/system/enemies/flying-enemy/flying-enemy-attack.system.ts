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

export function FlyingEnemyAttackSystem({
  engine,
  enemy,
  player,
  stateMachine,
}: Params) {
  let attackTimer = 0;
  const MAX_ATTACK_DURATION = 2;

  engine.onUpdate(() => {
    if (!stateMachine.isAttacking() || isPaused()) {
      attackTimer = 0;
      return;
    }

    attackTimer += engine.dt();

    if (attackTimer >= MAX_ATTACK_DURATION) {
      attackTimer = 0;
      if (enemy.pos.dist(enemy.initialPos) > enemy.patrolDistance) {
        stateMachine.dispatch(FLYING_ENEMY_EVENTS.RETURN);
      }
      return;
    }

    if (enemy.hp() <= 0 || enemy.isKnockedBack) return;

    const isBeyondPursuitLimit =
      enemy.pos.dist(enemy.initialPos) >
      enemy.maxPursuitDistance + enemy.patrolDistance;

    if (isBeyondPursuitLimit) {
      attackTimer = 0;
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
