import type { Engine, EngineGameObj } from "../../types/engine.type";
import { ENGINE_DEFAULT_EVENTS } from "../../types/events.enum";
import type { Player } from "../../types/player.interface";
import { GLOBAL_STATE } from "../../types/global-state.enum";
import { createBlink } from "../../utils/create-blink";
import { GLOBAL_STATE_CONTROLLER } from "../../core/global-state-controller";
import type { PlayerStateMachine } from "./player-state-machine";
import { PlayerStateTransition } from "./player-state-machine";
import { PLAYER_ANIMATIONS } from "../../types/animations.enum";
import { PLAYER_CONFIG } from "../../constansts/player.constat";
import type { PlayerSystemWithAPI } from "../../types/player-system.interface";
import { AnimationChecks } from "../../utils/animation.utils";

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

const { lockDurationMs: HURT_LOCK_DURATION, blinkCount: BLINK_COUNT } =
  PLAYER_CONFIG.combat.hurt;

const getHealthState = (): HealthState => ({
  current: GLOBAL_STATE_CONTROLLER.current()[GLOBAL_STATE.PLAYER_HP],
  max: GLOBAL_STATE_CONTROLLER.current()[GLOBAL_STATE.MAX_PLAYER_HP],
});

const setPlayerHP = (hp: number): void => {
  GLOBAL_STATE_CONTROLLER.set(GLOBAL_STATE.PLAYER_HP, hp);
};

const isDead = (hp: number): boolean => hp <= 0;

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
}: Params): PlayerSystemWithAPI<{}> {
  const ctx = stateMachine.getContext();

  const syncPlayerHealth = (): void => {
    setPlayerHP(player.hp());
  };

  const handleDeath = (): void => {
    stateMachine.transitionTo(PlayerStateTransition.EXPLODE);
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

  const lockHurtState = async (durationMs: number): Promise<void> => {
    ctx.health.isHurtLocked = true;
    await delay(durationMs);
    ctx.health.isHurtLocked = false;
  };

  const handleHurt = async ({ amount }: HurtParams): Promise<void> => {
    if (stateMachine.getState() === PLAYER_ANIMATIONS.EXPLODE) return;

    stateMachine.transitionTo(PlayerStateTransition.HURT);
    const playerHp = applyDamage(amount);

    if (isDead(playerHp)) return;

    lockHurtState(HURT_LOCK_DURATION);

    await applyBlinkEffect(engine, player, BLINK_COUNT);

    if (stateMachine.isKnockedBack()) {
      stateMachine.transitionTo(PlayerStateTransition.IDLE);
    }
  };

  const handleAnimationEnd = async (anim: string): Promise<void> => {
    if (AnimationChecks.isHurt(anim) && !ctx.health.isHurtLocked) {
      stateMachine.transitionTo(PlayerStateTransition.IDLE);
    }
  };

  player.onAnimEnd(handleAnimationEnd);
  player.on(ENGINE_DEFAULT_EVENTS.HEAL, syncPlayerHealth);
  player.on(ENGINE_DEFAULT_EVENTS.HURT, handleHurt);

  return {};
}
