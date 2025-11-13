import type { Engine } from "../../../../types/engine.type";
import type { Enemy } from "../../../../types/enemy.interface";
import type { Player } from "../../../../types/player.interface";
import type { FlyingEnemyStateMachine } from "./flying-enemy-state-machine";
import {
  ENGINE_DEFAULT_EVENTS,
  FLYING_ENEMY_EVENTS,
} from "../../../../types/events.enum";
import { HITBOX_TAGS, TAGS } from "../../../../types/tags.enum";
import { applyKnockback } from "../../../../utils/apply-knockback";
import { FLYING_ENEMY_SPRITES } from "../../../../types/sprites.enum";

type CollisionParams = {
  engine: Engine;
  enemy: Enemy;
  player: Player;
  stateMachine: FlyingEnemyStateMachine;
};

export function FlyingEnemyCollisionSystem({
  engine,
  enemy,
  player,
  stateMachine,
}: CollisionParams) {
  let collisionCooldownTimer = 0;
  const COLLISION_COOLDOWN = 0.6;

  function onSwordHitboxCollision(): void {
    enemy.hurt(1);

    if (enemy.behavior === FLYING_ENEMY_SPRITES.BLACK) {
      if (stateMachine.isIdle()) {
        stateMachine.dispatch(FLYING_ENEMY_EVENTS.ALERT);
      }
    }
  }

  async function onPlayerCollision(): Promise<void> {
    if (collisionCooldownTimer > 0) return;
    if (enemy.hp() <= 0 || enemy.isKnockedBack) return;

    collisionCooldownTimer = COLLISION_COOLDOWN;

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

  engine.onUpdate(() => {
    if (collisionCooldownTimer > 0) {
      collisionCooldownTimer -= engine.dt();
      if (collisionCooldownTimer < 0) collisionCooldownTimer = 0;
    }
  });

  enemy.onCollide(TAGS.PLAYER, onPlayerCollision);
  enemy.onCollide(HITBOX_TAGS.PLAYER_SWORD, onSwordHitboxCollision);
  enemy.on(FLYING_ENEMY_EVENTS.EXPLODE, onExplode);
  enemy.on(ENGINE_DEFAULT_EVENTS.HURT, onHurt);
}
