import type { Engine } from "../../../../types/engine.interface";
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

const ALERT_DURATION = 0.5;

export function FlyingEnemyAlertSystem({
  engine,
  enemy,
  player,
  stateMachine,
}: Params) {
  let alertTimer = 0;

  engine.onUpdate(() => {
    if (!stateMachine.isAlert() || isPaused()) return;
    if (enemy.hp() <= 0) return;
    
    enemy.flipX = player.pos.x < enemy.pos.x;

    alertTimer += engine.dt();

    if (alertTimer >= ALERT_DURATION) {
      const isPlayerInRange = enemy.pos.dist(player.pos) < enemy.range;
      const isWithinPursuitLimit =
        enemy.pos.dist(enemy.initialPos) <= enemy.maxPursuitDistance;

      if (isPlayerInRange && isWithinPursuitLimit) {
        stateMachine.dispatch(FLYING_ENEMY_EVENTS.ATTACK);
      } else {
        stateMachine.dispatch(FLYING_ENEMY_EVENTS.RETURN);
      }

      alertTimer = 0;
    }
  });
}
