import type { Enemy } from "../../types/enemy.interface";
import type { Engine } from "../../types/engine.interface";
import type { Position } from "../../types/position.interface";

export function DroneEntity(engine: Engine, initialPos: Position): Enemy {
  return engine.make([
    "drone",
    engine.pos(initialPos),
    engine.sprite("drone", { anim: "flying" }),
    engine.area({ shape: new engine.Rect(engine.vec2(0), 12, 12) }),
    engine.anchor("center"),
    engine.body({ gravityScale: 0 }),
    engine.offscreen({ distance: 400 }),
    engine.state("patrol-right", [
      "patrol-right",
      "patrol-left",
      "alert",
      "attack",
      "retreat",
    ]),
    engine.health(1),
    {
      speed: 100,
      pursuitSpeed: 150,
      range: 100,
      initialPos,
    },
  ]);
}
