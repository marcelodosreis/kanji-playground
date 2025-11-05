import type { Engine } from "../../types/engine.interface";
import type { Enemy } from "../../types/enemy.interface";
import type { Player } from "../../types/player.interface";

type Params = {
  engine: Engine;
  drone: Enemy;
};

export function DroneEventSystem({ engine, drone }: Params) {
  const player = engine.get("player", { recursive: true })[0] as Player;

  function onPlayerCollision() {
    if (player.isAttacking) return;
    drone.hurt(1);
    player.hurt(1);
  }

  function onAnimationEnd(anim: string) {
    if (anim === "explode") {
      engine.destroy(drone);
    }
  }

  function onExplode() {
    drone.collisionIgnore = ["player"];
    drone.unuse("body");
    drone.play("explode");
  }

  function onSwordHitboxCollision() {
    drone.hurt(1);
  }

  function onHurt() {
    if (drone.hp() === 0) {
      drone.trigger("explode");
    }
  }

  function onExitScreen() {
    if (drone.pos.dist(drone.initialPos) > 400) {
      drone.pos = drone.initialPos;
    }
  }

  drone.onCollide("player", onPlayerCollision);
  drone.onAnimEnd(onAnimationEnd);
  drone.on("explode", onExplode);
  drone.onCollide("sword-hitbox", onSwordHitboxCollision);
  drone.on("hurt", onHurt);
  drone.onExitScreen(onExitScreen);
}
