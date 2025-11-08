import { PLAYER_ANIMATIONS } from "../../../types/animations.enum";
import type { Engine, EngineGameObj } from "../../../types/engine.interface";
import { ENGINE_DEFAULT_EVENTS } from "../../../types/events.enum";
import type { Player } from "../../../types/player.interface";
import { LEVEL_SCENES } from "../../../types/scenes.enum";
import { GLOBAL_STATE } from "../../../types/state.interface";
import { applyKnockback } from "../../../utils/apply-knockback";
import { createBlink } from "../../../utils/create-blink";
import { screenFadeIn } from "../../../utils/screen-fade-in";
import { GLOBAL_STATE_CONTROLLER } from "../../global-state-controller";
import { type PlayerStateMachine } from "./player-state-machine";

type Params = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
  destinationName: string;
  previousSceneData: { exitName?: string };
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
  MIN_HP_FOR_RESPAWN: 1,
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

const isExplodeAnimation = (anim: string): boolean =>
  anim === PLAYER_ANIMATIONS.EXPLODE;

const isHurtAnimation = (anim: string): boolean =>
  anim === PLAYER_ANIMATIONS.HURT;

const shouldRespawnWithFullLife = (currentHp: number): boolean =>
  currentHp <= HEALTH_CONFIG.MIN_HP_FOR_RESPAWN;

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

export function PlayerHealthSystem({
  engine,
  player,
  stateMachine,
  destinationName,
  previousSceneData,
}: Params) {
  const hurtLock: HurtLockState = {
    isLocked: false,
  };

  const syncPlayerHealth = (): void => {
    setPlayerHP(player.hp());
  };

  const respawnPlayerFullLife = (maxHp: number): void => {
    setPlayerHP(maxHp);
    GLOBAL_STATE_CONTROLLER.set(GLOBAL_STATE.IS_PLAYER_IN_BOSS_FIGHT, false);
    engine.go(LEVEL_SCENES.ROOM_001, { exitName: null });
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

  const handleOutOfBounds = (): void => {
    const { current, max } = getHealthState();

    if (shouldRespawnWithFullLife(current)) {
      respawnPlayerFullLife(max);
    } else {
      setPlayerHP(current - 1);
      engine.go(destinationName, previousSceneData);
    }
  };

  const handleAnimationEnd = async (anim: string): Promise<void> => {
    const LAST_EXPLODE_PLAYER_FRAME = 109;
    if (
      isExplodeAnimation(anim) &&
      player.animFrame === LAST_EXPLODE_PLAYER_FRAME
    ) {
      const { max } = getHealthState();
      await engine.wait(2);
      await screenFadeIn({
        engine,
        durationSeconds: 0.4,
      });
      respawnPlayerFullLife(max);
      return;
    }

    if (isHurtAnimation(anim) && !hurtLock.isLocked) {
      stateMachine.dispatch("IDLE");
    }
  };

  player.on("outOfBounds", handleOutOfBounds);
  player.onAnimEnd(handleAnimationEnd);
  player.on(ENGINE_DEFAULT_EVENTS.HEAL, syncPlayerHealth);
  player.on(ENGINE_DEFAULT_EVENTS.HURT, handleHurt);
}
