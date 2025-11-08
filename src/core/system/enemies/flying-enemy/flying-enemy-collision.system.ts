import type { Engine } from "../../../../types/engine.interface";
import type { Enemy } from "../../../../types/enemy.interface";
import type { Player } from "../../../../types/player.interface";
import { ENGINE_DEFAULT_EVENTS, FLYING_ENEMY_EVENTS } from "../../../../types/events.enum";
import { HITBOX_TAGS, TAGS } from "../../../../types/tags.enum";
import { BAT_ANIMATIONS } from "../../../../types/animations.enum";
import { applyKnockback } from "../../../../utils/apply-knockback";

type Params = {
  engine: Engine;
  enemy: Enemy;
  player: Player;
};

export function FlyingEnemyCollisionSystem({ engine, enemy, player }: Params) {
  async function onPlayerCollision(): Promise<void> {
    if (enemy.hp() <= 0 || enemy.isKnockedBack) return;
    player.hurt(1, enemy);
    await applyKnockback({
      engine,
      target: enemy,
      source: player,
      strength: 5,
    });
  }

  function onSwordHitboxCollision(): void {
    enemy.hurt(1);
  }

  async function onHurt(): Promise<void> {
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

  function onExplode(): void {
    enemy.collisionIgnore = [TAGS.PLAYER];
    enemy.unuse("body");
    enemy.play(BAT_ANIMATIONS.EXPLODE);
  }

  enemy.onCollide(TAGS.PLAYER, onPlayerCollision);
  enemy.onCollide(HITBOX_TAGS.PLAYER_SWORD, onSwordHitboxCollision);
  enemy.on(FLYING_ENEMY_EVENTS.EXPLODE, onExplode);
  enemy.on(ENGINE_DEFAULT_EVENTS.HURT, onHurt);
}