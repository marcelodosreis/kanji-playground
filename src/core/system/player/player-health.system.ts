import { PLAYER_ANIMATIONS } from "../../../types/animations.enum";
import type { Engine, EngineGameObj } from "../../../types/engine.type";
import { ENGINE_DEFAULT_EVENTS } from "../../../types/events.enum";
import type { Player } from "../../../types/player.interface";
import { GLOBAL_STATE } from "../../../types/global-state.enum";
import { applyKnockback } from "../../../utils/apply-knockback";
import { createBlink } from "../../../utils/create-blink";
import { GLOBAL_STATE_CONTROLLER } from "../../global-state-controller";
import { type PlayerStateMachine } from "./player-state-machine";

type Params = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
};

type HurtParams = {
  amount: number;
  source: EngineGameObj;
};

type HealthState = {
  current: number;
  max: number;
};

type HurtLockState = {
  isLocked: boolean;
};

const HEALTH_CONFIG = {
  KNOCKBACK_STRENGTH: 1,
  BLINK_COUNT: 3,
  HURT_LOCK_DURATION_MS: 300,
};

const getHealthState = (): HealthState => ({
  current: GLOBAL_STATE_CONTROLLER.current()[GLOBAL_STATE.PLAYER_HP],
  max: GLOBAL_STATE_CONTROLLER.current()[GLOBAL_STATE.MAX_PLAYER_HP],
});

const setPlayerHP = (hp: number): void => {
  GLOBAL_STATE_CONTROLLER.set(GLOBAL_STATE.PLAYER_HP, hp);
};

const isDead = (hp: number): boolean => hp <= 0;

const isHurtAnimation = (anim: string): boolean =>
  anim === PLAYER_ANIMATIONS.HURT;

const calculateDamage = (current: number, amount: number): number =>
  current - amount;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const applyBlinkEffect = async (
  engine: Engine,
  player: Player,
  count: number
): Promise<void> => {
  for (let i = 0; i < count; i++) {
    await createBlink(engine, player);
  }
};

export function PlayerHealthSystem({ engine, player, stateMachine }: Params) {
  const hurtLock: HurtLockState = {
    isLocked: false,
  };

  const syncPlayerHealth = (): void => {
    setPlayerHP(player.hp());
  };

  const handleDeath = (): void => {
    stateMachine.dispatch("EXPLODE");
  };

  const applyDamage = (amount: number): number => {
    const { current } = getHealthState();
    const newHP = calculateDamage(current, amount);

    setPlayerHP(newHP);
    player.setHP(newHP);

    if (isDead(newHP)) {
      handleDeath();
    }

    return newHP;
  };

  const applyKnockbackEffect = (source: EngineGameObj): void => {
    if (!source) return;

    applyKnockback({
      engine,
      target: player,
      source,
      strength: HEALTH_CONFIG.KNOCKBACK_STRENGTH,
    });
  };

  const lockHurtState = async (durationMs: number): Promise<void> => {
    hurtLock.isLocked = true;
    await delay(durationMs);
    hurtLock.isLocked = false;
  };

  const handleHurt = async ({ amount, source }: HurtParams): Promise<void> => {
    if (stateMachine.getState() === PLAYER_ANIMATIONS.EXPLODE) return;

    stateMachine.dispatch("HURT");
    const playerHp = applyDamage(amount);

    applyKnockbackEffect(source);

    if (isDead(playerHp)) return;

    lockHurtState(HEALTH_CONFIG.HURT_LOCK_DURATION_MS);

    await applyBlinkEffect(engine, player, HEALTH_CONFIG.BLINK_COUNT);

    if (stateMachine.isKnockedBack()) {
      stateMachine.dispatch("IDLE");
    }
  };

  const handleAnimationEnd = async (anim: string): Promise<void> => {
    if (isHurtAnimation(anim) && !hurtLock.isLocked) {
      stateMachine.dispatch("IDLE");
    }
  };

  player.onAnimEnd(handleAnimationEnd);
  player.on(ENGINE_DEFAULT_EVENTS.HEAL, syncPlayerHealth);
  player.on(ENGINE_DEFAULT_EVENTS.HURT, handleHurt);
}
