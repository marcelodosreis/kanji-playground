import type { GameObj } from "kaplay";
import type { Engine } from "../types/engine.type";
import { smoothTransition } from "./smooth-transition";


export async function createBlink(
  engine: Engine,
  entity: GameObj,
  timespan = 0.1
) {
  await smoothTransition({
    engine,
    startValue: entity.opacity,
    endValue: 0,
    durationSeconds: timespan,
    onUpdate: (val) => (entity.opacity = val),
    easingFunction: engine.easings.linear,
  });
  await smoothTransition({
    engine,
    startValue: entity.opacity,
    endValue: 1,
    durationSeconds: timespan,
    onUpdate: (val) => (entity.opacity = val),
    easingFunction: engine.easings.linear,
  });
}