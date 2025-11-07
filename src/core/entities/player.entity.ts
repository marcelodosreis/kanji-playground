import { ENGINE_DEFAULT_EVENTS } from "../../types/events.enum";
import type { Engine, EngineGameObj } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";
import { TAGS } from "../../types/tags.enum";
import { state } from "../global-state-controller";

export function PlayerEntity(engine: Engine): Player {
  const player = engine.make([
    TAGS.PLAYER,
    engine.pos(),
    engine.sprite(TAGS.PLAYER),
    engine.area({ shape: new engine.Rect(engine.vec2(0, 18), 12, 12) }),
    engine.anchor("center"),
    engine.body({ mass: 100, jumpForce: 320 }),
    engine.doubleJump(1),
    engine.opacity(),
    engine.health(state.current().playerHp),
    {
      speed: 150,
      controlHandlers: [],
      isAttacking: false,
      isKnockedBack: false,
    },
  ]);

  player.hurt = (amount: number, source?: EngineGameObj) => {
    player.trigger(ENGINE_DEFAULT_EVENTS.HURT, { source, amount });
  };

  return player;
}
