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
      player.play("fall");
    }
  }

  function handleGround() {
    if (!player.isAttacking) {
      player.play("idle");
    }
  }

  function handleHeadbutt() {
    if (!player.isAttacking) {
      player.play("fall");
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
    player.play("explode");
  }

  player.onFall(handleFall);
  player.onFallOff(handleFall);
  player.onGround(handleGround);
  player.onHeadbutt(handleHeadbutt);
  player.on("heal", handleHeal);
  player.on("hurt", handleHurt);
}
