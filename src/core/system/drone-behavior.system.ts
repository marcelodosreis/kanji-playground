import type { Engine } from "../../types/engine.interface";
import type { Enemy } from "../../types/enemy.interface";
import type { Player } from "../../types/player.interface";
import { TAGS } from "../../types/tags.enum";
import { DRONE_EVENTS } from "../../types/events.enum";

type Params = {
  engine: Engine;
  drone: Enemy;
};

export function DroneBehaviorSystem({ engine, drone }: Params) {
  const [player] = engine.get(TAGS.PLAYER, { recursive: true }) as Player[];

  const patrolRightEnter = async () => {
    await engine.wait(3);
    if (drone.state === DRONE_EVENTS.PATROL_RIGHT && drone.hp() > 0) {
      drone.enterState(DRONE_EVENTS.PATROL_LEFT);
    }
  };

  const patrolRightUpdate = () => {
    if (drone.hp() <= 0) return;

    if (isPlayerInRange()) {
      drone.enterState(DRONE_EVENTS.ALERT);
      return;
    }
    drone.flipX = false;
    drone.move(drone.speed, 0);
  };

  const patrolLeftEnter = async () => {
    await engine.wait(3);
    if (drone.state === DRONE_EVENTS.PATROL_LEFT && drone.hp() > 0) {
      drone.enterState(DRONE_EVENTS.PATROL_RIGHT);
    }
  };

  const patrolLeftUpdate = () => {
    if (drone.hp() <= 0) return;

    if (isPlayerInRange()) {
      drone.enterState(DRONE_EVENTS.ALERT);
      return;
    }
    drone.flipX = true;
    drone.move(-drone.speed, 0);
  };

  const alertEnter = async () => {
    await engine.wait(1);
    if (drone.hp() <= 0) return;

    if (isPlayerInRange()) {
      drone.enterState(DRONE_EVENTS.ATTACK);
      return;
    }
    drone.enterState(DRONE_EVENTS.PATROL_RIGHT);
  };

  const attackUpdate = () => {
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
  };

  function isPlayerInRange(): boolean {
    return drone.pos.dist(player.pos) < drone.range;
  }

  drone.onStateUpdate(DRONE_EVENTS.ATTACK, attackUpdate);
  drone.onStateEnter(DRONE_EVENTS.ALERT, alertEnter);
  drone.onStateEnter(DRONE_EVENTS.PATROL_RIGHT, patrolRightEnter);
  drone.onStateUpdate(DRONE_EVENTS.PATROL_RIGHT, patrolRightUpdate);
  drone.onStateEnter(DRONE_EVENTS.PATROL_LEFT, patrolLeftEnter);
  drone.onStateUpdate(DRONE_EVENTS.PATROL_LEFT, patrolLeftUpdate);
}
