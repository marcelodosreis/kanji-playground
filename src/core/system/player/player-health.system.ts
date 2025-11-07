import { PLAYER_ANIMATIONS } from "../../../types/animations.enum";
import type { Engine, EngineGameObj } from "../../../types/engine.interface";
import { ENGINE_DEFAULT_EVENTS } from "../../../types/events.enum";
import type { Player } from "../../../types/player.interface";
import { LEVEL_SCENES } from "../../../types/scenes.enum";
import { GLOBAL_STATE } from "../../../types/state.interface";
import { applyKnockback } from "../../../utils/apply-knockback";
import { createBlink } from "../../../utils/create-blink";
import { state } from "../../global-state-controller";
import { PLAYER_STATE, type PlayerStateMachine } from "./player-state-machine";

type Params = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
  destinationName: string;
  previousSceneData: { exitName?: string };
};

export function PlayerHealthSystem({
  engine,
  player,
  stateMachine,
  destinationName,
  previousSceneData,
}: Params) {
  function handleHeal() {
    syncPlayerHealth();
  }

  async function handleHurt(params: { amount: number; source: EngineGameObj }) {
    stateMachine.dispatch("HURT");
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

    player.isKnockedBack = false;
    if (stateMachine.getState() === PLAYER_STATE.HURT) {
      stateMachine.dispatch("IDLE");
    }
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
    stateMachine.dispatch("DEAD");
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
