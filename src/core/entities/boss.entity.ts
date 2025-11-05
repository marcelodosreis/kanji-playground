import type { Boss } from "../../types/boss.interface";
import type { Engine } from "../../types/engine.interface";
import type { Position } from "../../types/position.interface";

export function BossEntity(engine: Engine, initialPos: Position): Boss {
  return engine.make([
    engine.pos(initialPos),
    engine.sprite("burner", { anim: "idle" }),
    engine.area({ shape: new engine.Rect(engine.vec2(0, 10), 12, 12) }),
    engine.body({ mass: 100, jumpForce: 320 }),
    engine.anchor("center"),
    engine.state("idle", [
      "idle",
      "follow",
      "open-fire",
      "fire",
      "shut-fire",
      "explode",
    ]),
    engine.health(1),
    engine.opacity(1),
    {
      pursuitSpeed: 100,
      fireRange: 40,
      fireDuration: 1,
    },
  ]);
}
