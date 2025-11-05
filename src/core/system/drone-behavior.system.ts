import type { Engine } from "../../types/engine.interface";
import type { Enemy } from "../../types/enemy.interface";
import type { Player } from "../../types/player.interface";

export function DroneBehaviorSystem(engine: Engine, drone: Enemy) {
  const player = engine.get("player", { recursive: true })[0] as Player;

  drone.onStateEnter("patrol-right", async () => {
    await engine.wait(3);
    if (drone.state === "patrol-right") drone.enterState("patrol-left");
  });

  drone.onStateUpdate("patrol-right", () => {
    if (drone.pos.dist(player.pos) < drone.range) {
      drone.enterState("alert");
      return;
    }
    drone.flipX = false;
    drone.move(drone.speed, 0);
  });

  drone.onStateEnter("patrol-left", async () => {
    await engine.wait(3);
    if (drone.state === "patrol-left") drone.enterState("patrol-right");
  });

  drone.onStateUpdate("patrol-left", () => {
    if (drone.pos.dist(player.pos) < drone.range) {
      drone.enterState("alert");
      return;
    }
    drone.flipX = true;
    drone.move(-drone.speed, 0);
  });

  drone.onStateEnter("alert", async () => {
    await engine.wait(1);
    if (drone.pos.dist(player.pos) < drone.range) {
      drone.enterState("attack");
      return;
    }
    drone.enterState("patrol-right");
  });

  drone.onStateUpdate("attack", () => {
    if (drone.pos.dist(player.pos) > drone.range) {
      drone.enterState("alert");
      return;
    }
    drone.flipX = player.pos.x <= drone.pos.x;
    drone.moveTo(
      engine.vec2(player.pos.x, player.pos.y + 12),
      drone.pursuitSpeed
    );
  });
}
