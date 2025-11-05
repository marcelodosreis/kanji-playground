import type { Engine } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";
import { createBlink } from "../../utils/create-blink";
import { state } from "../state";

type Params = {
  engine: Engine;
  player: Player;
};

export function PlayerEventSystem({ engine, player }: Params) {
  player.onFall(() => {
    player.play("fall");
  });

  player.onFallOff(() => {
    player.play("fall");
  });

  player.onGround(() => {
    player.play("idle");
  });

  player.onHeadbutt(() => {
    player.play("fall");
  });

  player.on("heal", () => {
    state.set("playerHp", player.hp());
  });

  player.on("hurt", () => {
    createBlink(engine, player);
    if (player.hp() > 0) {
      state.set("playerHp", player.hp());
      return;
    }

    state.set("playerHp", state.current().maxPlayerHp);
    player.play("explode");
  });

  player.onAnimEnd((anim) => {
    if (anim === "explode") {
      engine.go("room001", { exitName: null });
    }
  });
}
