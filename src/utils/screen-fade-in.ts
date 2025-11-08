import { COLORS } from "../types/colors.enum";
import type { Engine } from "../types/engine.interface";
import { smoothTransition } from "./smooth-transition";

export type OverlayEntity = {
  pos: { x: number; y: number };
  destroy?: () => void;
};

export type CreateBackgroundParams = {
  engine: Engine;
  color?: string;
  z?: number;
  startX?: number;
};

export type TweenBackgroundParams = {
  engine: Engine;
  durationSeconds?: number;
};

async function waitOneFrame(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame !== "undefined") {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(() => resolve(), 0);
    }
  });
}

function createBackground({
  engine,
  color = COLORS.BACKGROUND_PRIMARY,
  z = 9999,
  startX,
}: CreateBackgroundParams): OverlayEntity {
  const sx = typeof startX === "number" ? startX : -engine.width();

  const overlay = engine.add([
    engine.pos(sx, 0),
    engine.fixed(),
    engine.rect(engine.width(), engine.height()),
    engine.color(color),
    engine.z(z),
  ]) as OverlayEntity;

  return overlay;
}

export async function screenFadeIn({
  engine,
  durationSeconds = 0.4,
}: TweenBackgroundParams): Promise<void> {
  const background = createBackground({
    engine,
    color: COLORS.BACKGROUND_PRIMARY,
    z: 9999,
  });

  const startX = background.pos.x;
  const endX = 0;
  const totalMs = durationSeconds * 1000;

  await waitOneFrame();

  smoothTransition({
    engine,
    startValue: startX,
    endValue: endX,
    durationSeconds,
    onUpdate: (val) => (background.pos.x = val),
    easingFunction: engine.easings.linear,
  });

  await new Promise((resolve) => setTimeout(resolve, totalMs + 50));
}
