import type { Engine } from "../../../types/engine.type";
import type { Enemy } from "../../../types/enemy.interface";
import type { Player } from "../../../types/player.interface";
import type { FlyingEnemyStateMachine } from "./fly-enemy-state-machine";
import { FLYING_ENEMY_EVENTS } from "../../../types/events.enum";
import { isPaused } from "../../../utils/is-paused";
import type { FlyingEnemyMovementSystem } from "./flying-enemy-movement.system";
import type { FlyingEnemyDetectionSystem } from "./flying-enemy-detection.system";

type AlertParams = {
  engine: Engine;
  enemy: Enemy;
  player: Player;
  stateMachine: FlyingEnemyStateMachine;
  movement: ReturnType<typeof FlyingEnemyMovementSystem>;
  detection: ReturnType<typeof FlyingEnemyDetectionSystem>;
};

const ALERT_DURATION = 0.5;

export function FlyingEnemyAlertSystem({
  engine,
  enemy,
  player,
  stateMachine,
  movement,
  detection,
}: AlertParams) {
  let alertTimer = 0;

  function shouldStopAlert(): boolean {
    return !stateMachine.isAlert() || isPaused() || enemy.hp() <= 0;
  }

  function decideNextState(): void {
    const isPlayerInRange = detection.isPlayerWithinCurrentRange();
    const isWithinLimit = detection.isWithinCurrentPursuitLimit();

    if (isPlayerInRange && isWithinLimit) {
      stateMachine.dispatch(FLYING_ENEMY_EVENTS.ATTACK);
    } else {
      stateMachine.dispatch(FLYING_ENEMY_EVENTS.RETURN);
    }
  }

  engine.onUpdate(() => {
    if (shouldStopAlert()) {
      alertTimer = 0;
      return;
    }

    movement.faceDirection(player.pos.x);

    alertTimer += engine.dt();

    if (alertTimer >= ALERT_DURATION) {
      decideNextState();
      alertTimer = 0;
    }
  });
}
