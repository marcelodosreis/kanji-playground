import type { LerpValue } from "kaplay";
import type { Engine } from "../types/engine.type";

export interface smoothTransitionParams<V extends LerpValue> {
  engine: Engine;
  startValue: V;
  endValue: V;
  durationSeconds: number;
  onUpdate: (value: V) => void;
  easingFunction?: (t: number) => number;
}

export function smoothTransition<V extends LerpValue>(
  params: smoothTransitionParams<V>
): any {
  const {
    engine,
    startValue,
    endValue,
    durationSeconds,
    onUpdate,
    easingFunction = engine.easings.linear,
  } = params;

  return engine.tween(
    startValue,
    endValue,
    durationSeconds,
    onUpdate,
    easingFunction
  );
}
