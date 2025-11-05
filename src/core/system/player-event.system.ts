import { PLAYER_ANIMATIONS } from "../../types/animations.enum";
import type { Engine } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";
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
    state.set("playerHp", player.hp());
  }

  function handleHurt() {
    createBlink(engine, player);
    if (player.hp() > 0) {
      state.set("playerHp", player.hp());
      return;
    }
    player.play(PLAYER_ANIMATIONS.EXPLODE);
  }

  player.onFall(handleFall);
  player.onFallOff(handleFall);
  player.onGround(handleGround);
  player.onHeadbutt(handleHeadbutt);
  player.on("heal", handleHeal);
  player.on("hurt", handleHurt);
}
