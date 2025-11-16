import type { Engine, EngineGameObj } from "../types/engine.type";

export type BaseEffect = EngineGameObj & {
  play: (anim: string) => void;
  onAnimEnd: (callback: () => void) => void;
};

type SpawnEffectParams = {
  engine: Engine;
  sprite: string;
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  z?: number;
  onEnd?: () => void;
};

export function effect({
  engine,
  sprite,
  x,
  y,
  scale = 1,
  rotate = 0,
  z = 1,
  onEnd,
}: SpawnEffectParams): BaseEffect {
  const effect = engine.add([
    engine.sprite(sprite),
    engine.pos(x, y),
    engine.anchor("center"),
    engine.scale(scale),
    engine.rotate(rotate),
    engine.z(z),
  ]) as BaseEffect;

  effect.onAnimEnd(() => {
    effect.destroy();
    onEnd?.();
  });

  return effect;
}
