import { createTransientHitbox } from "../../helpers/hitbox.helper";
import { PLAYER_ANIMATIONS } from "../../types/animations.enum";
import type { Engine } from "../../types/engine.type";
import type { Player } from "../../types/player.interface";
import { EXTRA_TAGS, HITBOX_TAGS } from "../../types/tags.enum";
import { applyKnockback } from "../../utils/apply-knockback";
import { isPaused } from "../../utils/is-paused";
import { type PlayerStateMachine } from "./player-state-machine";

type Params = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
  orientationSystem: {
    lockOrientation: () => void;
    unlockOrientation: () => void;
  };
};

type AttackState = {
  currentHitboxDestroy: (() => void) | null;
  lastCheckedFrame: number;
};

const ATTACK_CONFIG = {
  KEY: "z",
  HITBOX_START_FRAME: 1,
  HITBOX_END_FRAME: 5,
  HITBOX_DIMENSIONS: {
    width: 32,
    height: 16,
    offsetY: 9,
  },
};

const createHitboxConfig = (isFlipped: boolean) => ({
  width: ATTACK_CONFIG.HITBOX_DIMENSIONS.width,
  height: ATTACK_CONFIG.HITBOX_DIMENSIONS.height,
  offsetX: isFlipped ? -ATTACK_CONFIG.HITBOX_DIMENSIONS.width : 0,
  offsetY: ATTACK_CONFIG.HITBOX_DIMENSIONS.offsetY,
});

const shouldCreateHitbox = (frame: number, hasHitbox: boolean): boolean =>
  frame === ATTACK_CONFIG.HITBOX_START_FRAME && !hasHitbox;

const shouldDestroyHitbox = (frame: number, hasHitbox: boolean): boolean =>
  frame === ATTACK_CONFIG.HITBOX_END_FRAME && hasHitbox;

const isAttackAnimation = (anim: string): boolean =>
  anim === PLAYER_ANIMATIONS.ATTACK;

const canAttack = (key: string, stateMachine: PlayerStateMachine): boolean =>
  !isPaused() && key === ATTACK_CONFIG.KEY && !stateMachine.isAttacking();

export function PlayerAttackSystem({
  engine,
  player,
  stateMachine,
  orientationSystem,
}: Params) {
  player.controlHandlers = player.controlHandlers || [];

  const state: AttackState = {
    currentHitboxDestroy: null,
    lastCheckedFrame: -1,
  };

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
      onCollide: (enemy) => {
        applyKnockback({
          engine,
          target: player,
          source: enemy,
          strength: 0.4,
        });
      },
    });

    state.currentHitboxDestroy = destroy;
  };

  const destroySwordHitbox = (): void => {
    if (state.currentHitboxDestroy) {
      state.currentHitboxDestroy();
      state.currentHitboxDestroy = null;
    }
  };

  const resetAttackState = (): void => {
    destroySwordHitbox();
    state.lastCheckedFrame = -1;
  };

  const handleHitboxLifecycle = (currentFrame: number): void => {
    if (shouldCreateHitbox(currentFrame, !!state.currentHitboxDestroy)) {
      createSwordHitbox();
    }

    if (shouldDestroyHitbox(currentFrame, !!state.currentHitboxDestroy)) {
      destroySwordHitbox();
    }
  };

  const checkAnimationFrame = (): void => {
    if (!isAttackAnimation(player.curAnim() as PLAYER_ANIMATIONS)) return;

    const currentFrame = player.animFrame;
    if (currentFrame === state.lastCheckedFrame) return;

    state.lastCheckedFrame = currentFrame;
    handleHitboxLifecycle(currentFrame);
  };

  const handleKeyPress = async (key: string): Promise<void> => {
    if (!canAttack(key, stateMachine)) return;

    orientationSystem.lockOrientation();
    stateMachine.dispatch("ATTACK");
    resetAttackState();
  };

  const onAttackAnimationEnd = (anim: string): void => {
    if (!isAttackAnimation(anim)) return;

    resetAttackState();
    orientationSystem.unlockOrientation();

    if (stateMachine.getState() === PLAYER_ANIMATIONS.ATTACK) {
      stateMachine.dispatch("IDLE");
    }
  };

  player.controlHandlers.push(engine.onKeyPress(handleKeyPress));
  player.onAnimEnd(onAttackAnimationEnd);
  engine.onUpdate(checkAnimationFrame);
}
