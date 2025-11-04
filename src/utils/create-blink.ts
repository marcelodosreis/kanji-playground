import type { GameObj } from "kaplay";
import type { Engine } from "../types/engine.interface";

export async function createBlink(
  engine: Engine,
  entity: GameObj,
  timespan = 0.1
) {
  await engine.tween(
    entity.opacity,
    0,
    timespan,
    (val) => (entity.opacity = val),
    engine.easings.linear
  );
  engine.tween(
    entity.opacity,
    1,
    timespan,
    (val) => (entity.opacity = val),
    engine.easings.linear
  );
}
