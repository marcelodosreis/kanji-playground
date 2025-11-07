// player-health.system.ts
import { PLAYER_ANIMATIONS } from "../../types/animations.enum";
import type { Engine, EngineGameObj } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";
import { GLOBAL_STATE } from "../../types/state.interface";
import { LEVEL_SCENES } from "../../types/scenes.enum";
import { createBlink } from "../../utils/create-blink";
import { applyKnockback } from "../../utils/apply-knockback";
import { state } from "../state";
import { ENGINE_DEFAULT_EVENTS } from "../../types/events.enum";

type Params = {
  engine: Engine;
  player: Player;
  destinationName: string;
  previousSceneData: { exitName?: string };
};

export function PlayerHealthSystem({
  engine,
  player,
  destinationName,
  previousSceneData,
}: Params) {
  function handleHeal() {
    syncPlayerHealth();
  }

  async function handleHurt(params: { amount: number; source: EngineGameObj }) {
    const playerHp = await applyDamage(params.amount);

    if (params.source) {
      applyKnockback({
        engine,
        target: player,
        source: params.source,
        strength: 1,
      });
    }

    if (playerHp <= 0) return;
    await createBlink(engine, player);
    await createBlink(engine, player);
    await createBlink(engine, player);
  }

  function syncPlayerHealth() {
    state.set(GLOBAL_STATE.PLAYER_HP, player.hp());
  }

  function applyDamage(amount: number) {
    const current = state.current()[GLOBAL_STATE.PLAYER_HP];
    const newHP = current - amount;
    state.set(GLOBAL_STATE.PLAYER_HP, newHP);
    player.setHP(newHP);
    if (newHP <= 0) handleDeath();
    return newHP;
  }

  function handleDeath() {
    player.play(PLAYER_ANIMATIONS.EXPLODE);
  }

  async function respawnPlayerFullLife(maxHp: number) {
    state.set(GLOBAL_STATE.PLAYER_HP, maxHp);
    state.set(GLOBAL_STATE.IS_PLAYER_IN_BOSS_FIGHT, false);
    engine.go(LEVEL_SCENES.ROOM_001, { exitName: null });
  }

  function handleOutOfBounds() {
    const currentHp = state.current()[GLOBAL_STATE.PLAYER_HP];
    const maxHp = state.current()[GLOBAL_STATE.MAX_PLAYER_HP];
    if (currentHp <= 1) respawnPlayerFullLife(maxHp);
    else {
      state.set(GLOBAL_STATE.PLAYER_HP, currentHp - 1);
      engine.go(destinationName, previousSceneData);
    }
  }

  player.on("outOfBounds", handleOutOfBounds);
  player.onAnimEnd((anim: string) => {
    if (anim === PLAYER_ANIMATIONS.EXPLODE) {
      respawnPlayerFullLife(state.current()[GLOBAL_STATE.MAX_PLAYER_HP]);
    }
  });
  player.on(ENGINE_DEFAULT_EVENTS.HEAL, handleHeal);
  player.on(ENGINE_DEFAULT_EVENTS.HURT, handleHurt);
}
