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
  function onSwordHitboxCollision(): void {
    enemy.hurt(1);
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

  enemy.onCollide(HITBOX_TAGS.PLAYER_SWORD, onSwordHitboxCollision);
  enemy.on(FLYING_ENEMY_EVENTS.EXPLODE, onExplode);
  enemy.on(ENGINE_DEFAULT_EVENTS.HURT, onHurt);
}
