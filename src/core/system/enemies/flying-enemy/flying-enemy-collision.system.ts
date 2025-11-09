import type { Engine } from "../../../../types/engine.type";
import type { Enemy } from "../../../../types/enemy.interface";
import type { Player } from "../../../../types/player.interface";
import {
  ENGINE_DEFAULT_EVENTS,
  FLYING_ENEMY_EVENTS,
} from "../../../../types/events.enum";
import { HITBOX_TAGS, TAGS } from "../../../../types/tags.enum";
import { applyKnockback } from "../../../../utils/apply-knockback";
import { FLYING_ENEMY_SPRITES } from "../../../../types/sprites.enum";

type Params = {
  engine: Engine;
  enemy: Enemy;
  player: Player;
};

export function FlyingEnemyCollisionSystem({ engine, enemy, player }: Params) {
  let lastCollisionTime = 0;
  const collisionCooldown = 0.6; // 600ms de cooldown

  function onSwordHitboxCollision(): void {
    enemy.hurt(1);
  }

  async function onPlayerCollision(): Promise<void> {
    const now = performance.now() / 1000;
    
    // Se colidiu recentemente, ignora
    if (now - lastCollisionTime < collisionCooldown) return;
    if (enemy.hp() <= 0 || enemy.isKnockedBack) return;
    
    lastCollisionTime = now;
    
    player.hurt(1, enemy);
    await applyKnockback({
      engine,
      target: enemy,
      source: player,
      strength: 5,
    });
  }

  async function onHurt(): Promise<void> {
    if (enemy.hp() === 0) {
      return enemy.enterState(FLYING_ENEMY_EVENTS.EXPLODE);
    }
    await applyKnockback({
      engine,
      target: enemy,
      source: player,
      strength: 2,
      verticalPower: enemy.behavior === FLYING_ENEMY_SPRITES.PURPLE ? 40 : 0,
    });
  }

  function onExplode(): void {
    enemy.collisionIgnore = [TAGS.PLAYER];
    enemy.unuse("body");
  }

  enemy.onCollide(TAGS.PLAYER, onPlayerCollision);
  enemy.onCollide(HITBOX_TAGS.PLAYER_SWORD, onSwordHitboxCollision);
  enemy.on(FLYING_ENEMY_EVENTS.EXPLODE, onExplode);
  enemy.on(ENGINE_DEFAULT_EVENTS.HURT, onHurt);
}