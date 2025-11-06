import type { Engine } from "../../types/engine.interface";
import type { Enemy } from "../../types/enemy.interface";
import type { Player } from "../../types/player.interface";
import { BAT_ANIMATIONS } from "../../types/animations.enum";
import { HITBOX_TAGS, TAGS } from "../../types/tags.enum";
import { DRONE_EVENTS, ENGINE_DEFAULT_EVENTS } from "../../types/events.enum";

type Params = { engine: Engine; drone: Enemy };

export function DroneEventHandlerSystem({ engine, drone }: Params) {
  const [player] = engine.get(TAGS.PLAYER, { recursive: true }) as Player[];

  function onPlayerCollision() {
    drone.hurt(1);
    player.hurt(1);
  }

  function onAnimationEnd(anim: string) {
    if (anim === BAT_ANIMATIONS.EXPLODE) {
      engine.destroy(drone);
    }
  }

  function onExplode() {
    drone.collisionIgnore = [TAGS.PLAYER];
    drone.unuse("body");
    drone.play(BAT_ANIMATIONS.EXPLODE);
  }

  function onSwordHitboxCollision() {
    drone.hurt(1);
  }

  function onHurt() {
    if (drone.hp() === 0) {
      drone.trigger(DRONE_EVENTS.EXPLODE);
    }
  }

  drone.onCollide(TAGS.PLAYER, onPlayerCollision);
  drone.onCollide(HITBOX_TAGS.PLAYER_SWORD, onSwordHitboxCollision);
  drone.on(DRONE_EVENTS.EXPLODE, onExplode);
  drone.on(ENGINE_DEFAULT_EVENTS.HURT, onHurt);
  drone.onAnimEnd(onAnimationEnd);
}
