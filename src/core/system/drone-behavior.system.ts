import type { Engine } from "../../types/engine.interface";
import type { Enemy } from "../../types/enemy.interface";
import type { Player } from "../../types/player.interface";

type Params = {
  engine: Engine;
  drone: Enemy;
};

export function DroneBehaviorSystem({ engine, drone }: Params) {
  const player = engine.get("player", { recursive: true })[0] as Player;

  async function patrolRightEnter() {
    await engine.wait(3);
    if (drone.state === "patrol-right") {
      drone.enterState("patrol-left");
    }
  }

  function patrolRightUpdate() {
    if (isPlayerInRange()) {
      drone.enterState("alert");
      return;
    }
    drone.flipX = false;
    drone.move(drone.speed, 0);
  }

  async function patrolLeftEnter() {
    await engine.wait(3);
    if (drone.state === "patrol-left") {
      drone.enterState("patrol-right");
    }
  }

  function patrolLeftUpdate() {
    if (isPlayerInRange()) {
      drone.enterState("alert");
      return;
    }
    drone.flipX = true;
    drone.move(-drone.speed, 0);
  }

  async function alertEnter() {
    await engine.wait(1);
    if (isPlayerInRange()) {
      drone.enterState("attack");
      return;
    }
    drone.enterState("patrol-right");
  }

  function attackUpdate() {
    if (!isPlayerInRange()) {
      drone.enterState("alert");
      return;
    }
    drone.flipX = player.pos.x <= drone.pos.x;
    drone.moveTo(
      engine.vec2(player.pos.x, player.pos.y + 12),
      drone.pursuitSpeed
    );
  }

  function isPlayerInRange(): boolean {
    return drone.pos.dist(player.pos) < drone.range;
  }

  drone.onStateEnter("patrol-right", patrolRightEnter);
  drone.onStateUpdate("patrol-right", patrolRightUpdate);
  drone.onStateEnter("patrol-left", patrolLeftEnter);
  drone.onStateUpdate("patrol-left", patrolLeftUpdate);
  drone.onStateEnter("alert", alertEnter);
  drone.onStateUpdate("attack", attackUpdate);
}
