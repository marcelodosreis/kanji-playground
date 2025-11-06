import { PLAYER_ANIMATIONS } from "../../types/animations.enum";
import type { Engine } from "../../types/engine.interface";
import { ENGINE_DEFAULT_EVENTS } from "../../types/events.enum";
import type { Player } from "../../types/player.interface";
import { GLOBAL_STATE } from "../../types/state.interface";
import { createBlink } from "../../utils/create-blink";
import { state } from "../state";

type Params = {
  engine: Engine;
  player: Player;
};

export function PlayerEventSystem({ engine, player }: Params) {
  function handleFall() {
    if (!player.isAttacking) {
      player.play(PLAYER_ANIMATIONS.FALL);
    }
  }

  function handleGround() {
    if (!player.isAttacking) {
      player.play(PLAYER_ANIMATIONS.IDLE);
    }
  }

  function handleHeadbutt() {
    if (!player.isAttacking) {
      player.play(PLAYER_ANIMATIONS.FALL);
    }
  }

  function handleHeal() {
    state.set(GLOBAL_STATE.PLAYER_HP, player.hp());
  }

  function handleHurt() {
    createBlink(engine, player);
    if (player.hp() > 0) {
      state.set(GLOBAL_STATE.PLAYER_HP, player.hp());
      return;
    }
    player.play(PLAYER_ANIMATIONS.EXPLODE);
  }

  player.onFall(handleFall);
  player.onFallOff(handleFall);
  player.onGround(handleGround);
  player.onHeadbutt(handleHeadbutt);
  player.on(ENGINE_DEFAULT_EVENTS.HEAL, handleHeal);
  player.on(ENGINE_DEFAULT_EVENTS.HURT, handleHurt);
}
