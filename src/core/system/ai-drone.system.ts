// src/systems/drone/DroneAIStateSystem.ts
import type { Engine } from "../../types/engine.interface";
import type { Enemy } from "../../types/enemy.interface";
import type { Player } from "../../types/player.interface";
import { DRONE_EVENTS } from "../../types/events.enum";
import { TAGS } from "../../types/tags.enum";
import {
  isPaused,
  wrapWithPauseCheck,
} from "../../utils/wrap-with-pause-check";
import { state } from "../state";

type Params = { engine: Engine; drone: Enemy };

export function AIDroneSystem({ engine, drone }: Params) {
  const [player] = engine.get(TAGS.PLAYER, { recursive: true }) as Player[];

  function isPlayerInRange(): boolean {
    return drone.pos.dist(player.pos) < drone.range;
  }

  async function patrolRightEnter() {
    await engine.wait(3);
    if (
      drone.state === DRONE_EVENTS.PATROL_RIGHT &&
      drone.hp() > 0 &&
      !isPaused()
    ) {
      drone.enterState(DRONE_EVENTS.PATROL_LEFT);
    }
  }

  function patrolRightUpdate() {
    if (drone.hp() <= 0) return;
    if (isPlayerInRange()) {
      drone.enterState(DRONE_EVENTS.ALERT);
      return;
    }
    drone.flipX = false;
    drone.move(drone.speed, 0);
  }

  async function patrolLeftEnter() {
    await engine.wait(3);
    if (
      drone.state === DRONE_EVENTS.PATROL_LEFT &&
      drone.hp() > 0 &&
      !isPaused()
    ) {
      drone.enterState(DRONE_EVENTS.PATROL_RIGHT);
    }
  }

  function patrolLeftUpdate() {
    if (drone.hp() <= 0) return;
    if (isPlayerInRange()) {
      drone.enterState(DRONE_EVENTS.ALERT);
      return;
    }
    drone.flipX = true;
    drone.move(-drone.speed, 0);
  }

  async function alertEnter() {
    await engine.wait(1);
    if (drone.hp() <= 0 || isPaused()) return;
    if (isPlayerInRange()) {
      drone.enterState(DRONE_EVENTS.ATTACK);
      return;
    }
    drone.enterState(DRONE_EVENTS.PATROL_RIGHT);
  }

  function attackUpdate() {
    if (drone.hp() <= 0) return;
    if (!isPlayerInRange()) {
      drone.enterState(DRONE_EVENTS.ALERT);
      return;
    }
    drone.flipX = player.pos.x <= drone.pos.x;
    drone.moveTo(
      engine.vec2(player.pos.x, player.pos.y + 12),
      drone.pursuitSpeed
    );
  }

  function handleIsPausedChange(paused: boolean) {
    if (!paused) {
      drone.enterState(drone.state);
    }
  }

  function start() {
    state.subscribe("isPaused", handleIsPausedChange);

    drone.onStateEnter(
      DRONE_EVENTS.PATROL_RIGHT,
      wrapWithPauseCheck(patrolRightEnter)
    );
    drone.onStateUpdate(
      DRONE_EVENTS.PATROL_RIGHT,
      wrapWithPauseCheck(patrolRightUpdate)
    );
    drone.onStateEnter(
      DRONE_EVENTS.PATROL_LEFT,
      wrapWithPauseCheck(patrolLeftEnter)
    );
    drone.onStateUpdate(
      DRONE_EVENTS.PATROL_LEFT,
      wrapWithPauseCheck(patrolLeftUpdate)
    );
    drone.onStateEnter(DRONE_EVENTS.ALERT, wrapWithPauseCheck(alertEnter));
    drone.onStateUpdate(DRONE_EVENTS.ATTACK, wrapWithPauseCheck(attackUpdate));
  }

  start();
}
