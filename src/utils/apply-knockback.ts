import type { Engine, EngineGameObj } from "../types/engine.interface";

type KnockbackParams = {
  engine: Engine;
  target: EngineGameObj & { isKnockedBack?: boolean; speed: number };
  source: EngineGameObj;
  strength?: number;
  verticalPower?: number;
  stunDuration?: number;
};

export async function applyKnockback({
  engine,
  target,
  source,
  strength = 3,
  verticalPower = 40,
  stunDuration = 0.5,
}: KnockbackParams) {
  if (target.isKnockedBack) return;

  target.isKnockedBack = true;

  const direction = Math.sign(target.pos.x - source.pos.x);
  const baseSpeed = target.speed * 1.2 * strength;
  const duration = 0.3;
  const start = performance.now();

  const maxVerticalVel = -200;

  while (performance.now() - start < duration * 1000) {
    const t = (performance.now() - start) / 1000 / duration;
    const easeOut = 1 - (1 - t) * (1 - t);
    const currentSpeed = baseSpeed * (1 - easeOut);

    target.move(direction * currentSpeed, -verticalPower * (1 - t));

    if (target.vel && target.vel.y < maxVerticalVel) {
      target.vel.y = maxVerticalVel;
    }

    await engine.wait(0.016);
  }

  await engine.wait(stunDuration);
  target.isKnockedBack = false;
}
