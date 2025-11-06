import type { Engine } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";
import { TAGS } from "../../types/tags.enum";
import { state } from "../state";

export function PlayerEntity(engine: Engine): Player {
  return engine.make([
    TAGS.PLAYER,
    engine.pos(),
    engine.sprite(TAGS.PLAYER),
    engine.area({ shape: new engine.Rect(engine.vec2(0, 16), 16, 12) }),
    engine.anchor("center"),
    engine.body({ mass: 100, jumpForce: 320 }),
    engine.doubleJump(0),
    engine.opacity(),
    engine.health(state.current().playerHp),
    {
      speed: 150,
      controlHandlers: [],
      isAttacking: false,
    },
  ]);
}
