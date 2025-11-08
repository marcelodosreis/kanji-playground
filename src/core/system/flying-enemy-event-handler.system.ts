import type { Engine } from "../../types/engine.interface";
import type { Enemy } from "../../types/enemy.interface";
import type { Player } from "../../types/player.interface";
import { BAT_ANIMATIONS } from "../../types/animations.enum";
import { HITBOX_TAGS, TAGS } from "../../types/tags.enum";
import {
  FLYING_ENEMY_EVENTS,
  ENGINE_DEFAULT_EVENTS,
} from "../../types/events.enum";
import { applyKnockback } from "../../utils/apply-knockback";

type Params = { engine: Engine; enemy: Enemy };

export function FlyingEnemyEventHandlerSystem({ engine, enemy }: Params) {
  const [player] = engine.get(TAGS.PLAYER, { recursive: true }) as Player[];

  function applyCollisionDamage(player: Player) {
    player.hurt(1, enemy);
  }

  async function onPlayerCollision() {
    if (enemy.hp() <= 0 || enemy.isKnockedBack) return;
    applyCollisionDamage(player);
    await applyKnockback({
      engine,
      target: enemy,
      source: player,
      strength: 5,
    });
  }

  function onAnimationEnd(anim: string) {
    if (anim === BAT_ANIMATIONS.EXPLODE) {
      engine.destroy(enemy);
    }
  }

  function onExplode() {
    enemy.collisionIgnore = [TAGS.PLAYER];
    enemy.unuse("body");
    enemy.play(BAT_ANIMATIONS.EXPLODE);
  }

  function onSwordHitboxCollision() {
    enemy.hurt(1);
  }

  async function onHurt() {
    if (enemy.hp() === 0) {
      return enemy.trigger(FLYING_ENEMY_EVENTS.EXPLODE);
    }

    enemy.play(BAT_ANIMATIONS.HURT);
    await applyKnockback({
      engine,
      target: enemy,
      source: player,
      strength: 2,
    });
  }

  enemy.onCollide(TAGS.PLAYER, onPlayerCollision);
  enemy.onCollide(HITBOX_TAGS.PLAYER_SWORD, onSwordHitboxCollision);
  enemy.on(FLYING_ENEMY_EVENTS.EXPLODE, onExplode);
  enemy.on(ENGINE_DEFAULT_EVENTS.HURT, onHurt);
  enemy.onAnimEnd(onAnimationEnd);
}
