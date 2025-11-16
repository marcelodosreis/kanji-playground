import { ENGINE_DEFAULT_EVENTS } from "../types/events.enum";
import type { Engine, EngineGameObj } from "../types/engine.type";
import type { Player } from "../types/player.interface";
import { TAGS } from "../types/tags.enum";
import { playerHpAtom, store } from "../stores";

export function PlayerEntity(engine: Engine): Player {
  const player = engine.make([
    TAGS.PLAYER,
    engine.pos(),
    engine.sprite(TAGS.PLAYER),
    engine.area({ shape: new engine.Rect(engine.vec2(0, 0), 12, 12) }),
    engine.anchor("center"),
    engine.body({ mass: 100, jumpForce: 202 }),
    engine.doubleJump(1),
    engine.opacity(),
    engine.health(store.get(playerHpAtom)),
    {
      speed: 130,
      controlHandlers: [],
    },
  ]);

  player.hurt = (amount: number, source?: EngineGameObj) => {
    player.trigger(ENGINE_DEFAULT_EVENTS.HURT, { source, amount });
  };

  return player;
}
