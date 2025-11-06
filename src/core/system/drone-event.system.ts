import type { Engine } from "../../types/engine.interface";
import type { Enemy } from "../../types/enemy.interface";
import type { Player } from "../../types/player.interface";
import { DRONE_ANIMATIONS } from "../../types/animations.enum";
import { HITBOX_TAGS, TAGS } from "../../types/tags.enum";
import { DRONE_EVENTS } from "../../types/events.enum";

type Params = {
  engine: Engine;
  drone: Enemy;
};

export function DroneEventSystem({ engine, drone }: Params) {
  const [player] = engine.get(TAGS.PLAYER, { recursive: true }) as Player[];

  function onPlayerCollision() {
    player.hurt(1);
  }

  function onAnimationEnd(anim: string) {
    if (anim === DRONE_ANIMATIONS.EXPLODE) {
      engine.destroy(drone);
    }
  }

  function onExplode() {
    drone.collisionIgnore = [TAGS.PLAYER];
    drone.unuse("body");
    drone.play(DRONE_ANIMATIONS.EXPLODE);
  }

  function onSwordHitboxCollision() {
    drone.hurt(1);
  }

  function onHurt() {
    if (drone.hp() === 0) {
      drone.trigger(DRONE_EVENTS.EXPLODE);
    }
  }

  function onExitScreen() {
    if (drone.pos.dist(drone.initialPos) > 400) {
      drone.pos = drone.initialPos;
    }
  }

  drone.onCollide(TAGS.PLAYER, onPlayerCollision);
  drone.onAnimEnd(onAnimationEnd);
  drone.on(DRONE_EVENTS.EXPLODE, onExplode);
  drone.onCollide(HITBOX_TAGS.PLAYER_SWORD, onSwordHitboxCollision);
  drone.on("hurt", onHurt);
  drone.onExitScreen(onExitScreen);
}
