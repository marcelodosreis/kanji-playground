import { PLAYER_ANIMATIONS } from "../../../types/animations.enum";
import type { Engine, EngineGameObj } from "../../../types/engine.type";
import type { Player } from "../../../types/player.interface";
import { EXTRA_TAGS, HITBOX_TAGS } from "../../../types/tags.enum";
import { applyKnockback } from "../../../utils/apply-knockback";
import { isPaused } from "../../../utils/is-paused";
import { type PlayerStateMachine } from "./player-state-machine";

type Params = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
};

type SwordHitbox = EngineGameObj & {
  destroy: () => void;
};

type HitboxConfig = {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
};

type AttackState = {
  currentHitbox: SwordHitbox | null;
  lastCheckedFrame: number;
};

const ATTACK_CONFIG = {
  KEY: "z",
  HITBOX_START_FRAME: 1,
  HITBOX_END_FRAME: 5,
  HITBOX_DIMENSIONS: {
    width: 18,
    height: 16,
    offsetY: 9,
  },
};

const createHitboxConfig = (isFlipped: boolean): HitboxConfig => ({
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

export function PlayerAttackSystem({ engine, player, stateMachine }: Params) {
  player.controlHandlers = player.controlHandlers || [];

  const state: AttackState = {
    currentHitbox: null,
    lastCheckedFrame: -1,
  };

  const createSwordHitbox = (): SwordHitbox => {
    const config = createHitboxConfig(player.flipX);
    const hitboxShape = new engine.Rect(
      engine.vec2(0),
      config.width,
      config.height
    );

    const hitbox = player.add([
      engine.pos(config.offsetX, config.offsetY),
      engine.area({ shape: hitboxShape }),
      HITBOX_TAGS.PLAYER_SWORD,
    ]) as SwordHitbox;

    hitbox.onCollide(EXTRA_TAGS.HITTABLE, (enemy: EngineGameObj) => {
      applyKnockback({
        engine,
        target: player,
        source: enemy,
        strength: 0.4,
      });
    });

    return hitbox;
  };

  const destroySwordHitbox = (): void => {
    if (!state.currentHitbox) return;

    if (typeof state.currentHitbox.destroy === "function") {
      state.currentHitbox.destroy();
    } else {
      engine.destroy(state.currentHitbox as EngineGameObj);
    }

    state.currentHitbox = null;
  };

  const resetAttackState = (): void => {
    destroySwordHitbox();
    state.lastCheckedFrame = -1;
  };

  const handleHitboxLifecycle = (currentFrame: number): void => {
    if (shouldCreateHitbox(currentFrame, state.currentHitbox !== null)) {
      state.currentHitbox = createSwordHitbox();
    }

    if (shouldDestroyHitbox(currentFrame, state.currentHitbox !== null)) {
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

    stateMachine.dispatch("ATTACK");
    resetAttackState();
  };

  const onAttackAnimationEnd = (anim: string): void => {
    if (!isAttackAnimation(anim)) return;

    resetAttackState();

    if (stateMachine.getState() === PLAYER_ANIMATIONS.ATTACK) {
      stateMachine.dispatch("IDLE");
    }
  };

  player.controlHandlers.push(engine.onKeyPress(handleKeyPress));
  player.onAnimEnd(onAttackAnimationEnd);
  engine.onUpdate(checkAnimationFrame);
}
