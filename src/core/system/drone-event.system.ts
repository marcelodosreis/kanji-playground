import type { Engine } from "../../types/engine.interface";
import type { Enemy } from "../../types/enemy.interface";
import type { Player } from "../../types/player.interface";

export function DroneEventSystem(engine: Engine, drone: Enemy) {
  const player = engine.get("player", { recursive: true })[0] as Player;

  drone.onCollide("player", () => {
    if (player.isAttacking) return;
    drone.hurt(1);
    player.hurt(1);
  });

  drone.onAnimEnd((anim) => {
    if (anim === "explode") {
      engine.destroy(drone);
    }
  });

  drone.on("explode", () => {
    // engine.play("boom");
    drone.collisionIgnore = ["player"];
    drone.unuse("body");
    drone.play("explode");
  });

  drone.onCollide("sword-hitbox", () => {
    drone.hurt(1);
  });

  drone.on("hurt", () => {
    if (drone.hp() === 0) {
      drone.trigger("explode");
    }
  });

  drone.onExitScreen(() => {
    if (drone.pos.dist(drone.initialPos) > 400) {
      drone.pos = drone.initialPos;
    }
  });
}
