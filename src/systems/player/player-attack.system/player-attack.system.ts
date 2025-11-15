import { PLAYER_CONFIG } from "../../../constansts/player.constat";
import { spawnHitConfirm } from "../../../helpers/hit-confirm.helper";
import { createTransientHitbox } from "../../../helpers/hitbox.helper";
import type { Engine, EngineGameObj } from "../../../types/engine.type";
import type { PlayerSystemWithAPI } from "../../../types/player-system.interface";
import type { Player } from "../../../types/player.interface";
import { EXTRA_TAGS, HITBOX_TAGS } from "../../../types/tags.enum";
import {
  AnimationChecks,
  AnimationFrameChecks,
} from "../../../utils/animation.utils";
import { applyKnockback } from "../../../utils/apply-knockback";
import type { PlayerStateMachine } from "../player-state-machine";
import { PlayerStateTransition } from "../player-state-machine";

type Params = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
  orientationSystem: {
    lockDirection: () => void;
    unlockDirection: () => void;
  };
};

type AttackSystemAPI = {
  executeAttack: () => void;
};

const {
  hitbox: HITBOX_CONFIG,
  knockbackStrength: KNOCKBACK,
  hitConfirm: HIT_CONFIRM_CONFIG,
} = PLAYER_CONFIG.combat.attack;

const createHitboxConfig = (isFlipped: boolean) => ({
  width: HITBOX_CONFIG.width,
  height: HITBOX_CONFIG.height,
  offsetX: isFlipped ? -HITBOX_CONFIG.width : 0,
  offsetY: HITBOX_CONFIG.offsetY,
});

const shouldCreateHitbox = (frame: number, hasHitbox: boolean): boolean =>
  AnimationFrameChecks.isAtFrame(frame, HITBOX_CONFIG.startFrame) && !hasHitbox;

const shouldDestroyHitbox = (frame: number, hasHitbox: boolean): boolean =>
  AnimationFrameChecks.isAtFrame(frame, HITBOX_CONFIG.endFrame) && hasHitbox;

export function PlayerAttackSystem({
  engine,
  player,
  stateMachine,
  orientationSystem,
}: Params): PlayerSystemWithAPI<AttackSystemAPI> {
  const ctx = stateMachine.getContext();

  const createSwordHitbox = () => {
    const config = createHitboxConfig(player.flipX);
    const { destroy } = createTransientHitbox({
      engine,
      owner: player,
      width: config.width,
      height: config.height,
      offsetX: config.offsetX,
      offsetY: config.offsetY,
      tag: HITBOX_TAGS.PLAYER_SWORD,
      collideWithTag: EXTRA_TAGS.HITTABLE,
      onCollide: (target) => {
        spawnHitConfirm({
          engine,
          position: target.pos,
          isRight: target.pos.x > player.pos.x,
          scale: HIT_CONFIRM_CONFIG.scale,
        });
      },
    });

    ctx.combat.currentHitboxDestroy = destroy;
  };

  const destroySwordHitbox = (): void => {
    if (ctx.combat.currentHitboxDestroy) {
      ctx.combat.currentHitboxDestroy();
      ctx.combat.currentHitboxDestroy = null;
    }
  };

  const resetAttackState = (): void => {
    destroySwordHitbox();
    ctx.combat.lastCheckedAttackFrame = -1;
  };

  const updateHitboxLifecycle = (currentFrame: number): void => {
    const hasHitbox = !!ctx.combat.currentHitboxDestroy;

    if (shouldCreateHitbox(currentFrame, hasHitbox)) {
      createSwordHitbox();
    }

    if (shouldDestroyHitbox(currentFrame, hasHitbox)) {
      destroySwordHitbox();
    }
  };

  const applyAttackKnockback = () => {
    const fakeSource = {
      pos: {
        x: player.pos.x - (player.flipX ? 1 : -1),
      },
    };

    applyKnockback({
      engine,
      target: player,
      source: fakeSource as unknown as EngineGameObj,
      strength: KNOCKBACK,
    });
  };

  const updateAttackAnimation = (): void => {
    const currentAnim = player.curAnim();
    if (!currentAnim || !AnimationChecks.isAttack(currentAnim)) return;

    const currentFrame = player.animFrame;
    if (currentFrame === ctx.combat.lastCheckedAttackFrame) return;

    ctx.combat.lastCheckedAttackFrame = currentFrame;
    updateHitboxLifecycle(currentFrame);
    applyAttackKnockback();
  };

  const executeAttack = (): void => {
    if (stateMachine.isAttacking()) return;

    orientationSystem.lockDirection();
    stateMachine.transitionTo(PlayerStateTransition.ATTACK);
    resetAttackState();
  };

  const handleAttackAnimationEnd = (anim: string): void => {
    if (!AnimationChecks.isAttack(anim)) return;

    resetAttackState();
    orientationSystem.unlockDirection();

    if (stateMachine.isAttacking()) {
      stateMachine.transitionTo(PlayerStateTransition.IDLE);
    }
  };

  const update = (): void => {
    updateAttackAnimation();
  };

  player.onAnimEnd(handleAttackAnimationEnd);
  engine.onUpdate(update);

  return {
    executeAttack,
    update,
  };
}
