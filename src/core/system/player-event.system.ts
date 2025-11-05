import type { Engine } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";
import { createBlink } from "../../utils/create-blink";
import { state } from "../state";

type Params = {
  engine: Engine;
  player: Player;
};

export function PlayerEventSystem({ engine, player }: Params) {
  function onFall() {
    if (!player.isAttacking) {
      player.play("fall");
    }
  }

  function onFallOff() {
    if (!player.isAttacking) {
      player.play("fall");
    }
  }

  function onGround() {
    if (!player.isAttacking) {
      player.play("idle");
    }
  }

  function onHeadbutt() {
    if (!player.isAttacking) {
      player.play("fall");
    }
  }

  function onHeal() {
    state.set("playerHp", player.hp());
  }

  function onHurt() {
    createBlink(engine, player);
    if (player.hp() > 0) {
      state.set("playerHp", player.hp());
      return;
    }
    player.play("explode");
  }

  player.onFall(onFall);
  player.onFallOff(onFallOff);
  player.onGround(onGround);
  player.onHeadbutt(onHeadbutt);
  player.on("heal", onHeal);
  player.on("hurt", onHurt);
}
