import type { Engine } from "../../../types/engine.type";
import type { Enemy } from "../../../types/enemy.interface";
import type { Player } from "../../../types/player.interface";
import type { FlyingEnemyStateMachine } from "./fly-enemy-state-machine-system";
import {
  ENGINE_DEFAULT_EVENTS,
  FLYING_ENEMY_EVENTS,
} from "../../../types/events.enum";
import { HITBOX_TAGS, TAGS } from "../../../types/tags.enum";
import { applyKnockback } from "../../../utils/apply-knockback";
import { FLYING_ENEMY_SPRITES } from "../../../types/sprites.enum";
import type { FlyingEnemyOrganicMovementSystem } from "./flying-enemy-organic-movement.system";

type CollisionParams = {
  engine: Engine;
  enemy: Enemy;
  player: Player;
  stateMachine: FlyingEnemyStateMachine;
  organicMovement: ReturnType<typeof FlyingEnemyOrganicMovementSystem>;
};

export function FlyingEnemyCollisionSystem({
  engine,
  enemy,
  player,
  stateMachine,
  organicMovement,
}: CollisionParams) {
  let collisionCooldownTimer = 0;
  const COLLISION_COOLDOWN = 1;

  function onSwordHitboxCollision(): void {
    enemy.hurt(1);
  }

  async function onPlayerCollision(): Promise<void> {
    if (collisionCooldownTimer > 0) return;
    if (enemy.hp() <= 0 || enemy.isKnockedBack) return;

    if (enemy.behavior === FLYING_ENEMY_SPRITES.GREEN) {
      if (stateMachine.isAttacking()) {
        stateMachine.dispatch(FLYING_ENEMY_EVENTS.RETURN);
      }
    }

    collisionCooldownTimer = COLLISION_COOLDOWN;

    player.hurt(1, enemy);

    organicMovement.resetVelocity();
    await applyKnockback({
      engine,
      target: enemy,
      source: player,
      strength: 5,
    });
    organicMovement.resetVelocity();
  }

  async function onHurt(): Promise<void> {
    organicMovement.resetVelocity();
    await applyKnockback({
      engine,
      target: enemy,
      source: player,
      strength: 3,
      verticalPower: enemy.behavior === FLYING_ENEMY_SPRITES.PURPLE ? 40 : 0,
    });
    organicMovement.resetVelocity();

    if (enemy.hp() === 0) {
      return enemy.enterState(FLYING_ENEMY_EVENTS.EXPLODE);
    }
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
