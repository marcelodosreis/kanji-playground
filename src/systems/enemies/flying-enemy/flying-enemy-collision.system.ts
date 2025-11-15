import type { Engine } from "../../../types/engine.type";
import type { Enemy } from "../../../types/enemy.interface";
import type { Player } from "../../../types/player.interface";
import type { FlyingEnemyStateMachine } from "./fly-enemy-state-machine";
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
  let swordCooldown = 0;
  let bodyCooldown = 0;

  const COOLDOWN_ENEMY_BODY_HIT = 1;

  function canSwordHit() {
    return swordCooldown === 0;
  }

  function canBodyHit() {
    return bodyCooldown === 0;
  }

  function startBodyCooldown() {
    bodyCooldown = COOLDOWN_ENEMY_BODY_HIT;
  }

  function onSwordHitboxCollision(): void {
    if (!canSwordHit()) return;
    enemy.hurt(1);
  }

  async function onPlayerCollision(): Promise<void> {
    if (!canBodyHit()) return;
    if (enemy.hp() <= 0 || enemy.isKnockedBack) return;

    startBodyCooldown();

    if (enemy.behavior === FLYING_ENEMY_SPRITES.GREEN) {
      if (stateMachine.isAttacking()) {
        stateMachine.dispatch(FLYING_ENEMY_EVENTS.RETURN);
      }
    }

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
    const directionToPlayer = player.pos.x - enemy.pos.x;
    enemy.flipX = directionToPlayer < 0;

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
    if (swordCooldown > 0) {
      swordCooldown -= engine.dt();
      if (swordCooldown < 0) swordCooldown = 0;
    }
    if (bodyCooldown > 0) {
      bodyCooldown -= engine.dt();
      if (bodyCooldown < 0) bodyCooldown = 0;
    }
  });

  enemy.onCollide(TAGS.PLAYER, onPlayerCollision);
  enemy.onCollide(HITBOX_TAGS.PLAYER_SWORD, onSwordHitboxCollision);
  enemy.on(FLYING_ENEMY_EVENTS.EXPLODE, onExplode);
  enemy.on(ENGINE_DEFAULT_EVENTS.HURT, onHurt);
}
