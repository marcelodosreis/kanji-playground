import type { Engine, EngineGameObj } from "../types/engine.type";

type HitConfirmParams = {
  engine: Engine;
  position: { x: number; y: number };
  scale?: number;
  rotation?: number;
};

type HitEffect = EngineGameObj & {
  play: (anim: string) => void;
  onAnimEnd: (callback: () => void) => void;
};

const HIT_CONFIG = {
  SPRITE_NAME: "hit-effect",
  ANIMATION_NAME: "hit",
  DEFAULT_SCALE: 1,
  DEFAULT_ROTATION: 0,
} as const;

export function spawnHitConfirm({
  engine,
  position,
  scale = HIT_CONFIG.DEFAULT_SCALE,
  rotation = HIT_CONFIG.DEFAULT_ROTATION,
}: HitConfirmParams): void {
  const hitEffect = engine.add([
    engine.sprite(HIT_CONFIG.SPRITE_NAME),
    engine.pos(position.x, position.y),
    engine.anchor("center"),
    engine.scale(scale),
    engine.rotate(rotation),
    engine.z(100),
  ]) as HitEffect;

  hitEffect.play(HIT_CONFIG.ANIMATION_NAME);

  hitEffect.onAnimEnd(() => {
    hitEffect.destroy();
  });
}
