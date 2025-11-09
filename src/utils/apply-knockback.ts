import type { Engine, EngineGameObj } from "../types/engine.type";

type KnockbackParams = {
  engine: Engine;
  target: EngineGameObj & {
    isKnockedBack?: boolean;
    knockbackId?: number;
    speed: number;
  };
  source: EngineGameObj;
  strength?: number;
  verticalPower?: number;
  stunDuration?: number;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function applyKnockback({
  target,
  source,
  strength = 3,
  verticalPower = 40,
  stunDuration = 0.5,
}: KnockbackParams) {
  if (target.isKnockedBack) return;

  const myKnockbackId = performance.now();
  target.knockbackId = myKnockbackId;
  target.isKnockedBack = true;

  const direction = Math.sign(target.pos.x - source.pos.x);
  const baseSpeed = target.speed * 1.2 * strength;
  const duration = 0.3;
  const start = performance.now();
  const maxVerticalVel = -200;

  try {
    while (performance.now() - start < duration * 1000) {
      const t = (performance.now() - start) / 1000 / duration;
      const easeOut = 1 - (1 - t) * (1 - t);
      const currentSpeed = baseSpeed * (1 - easeOut);

      target.move(direction * currentSpeed, -verticalPower * (1 - t));

      if (target.vel && target.vel.y < maxVerticalVel) {
        target.vel.y = maxVerticalVel;
      }

      await wait(16);
    }

    await wait(stunDuration * 1000);
  } catch (error) {
    console.error("Knockback error:", error);
  } finally {
    if (target.knockbackId === myKnockbackId) {
      target.isKnockedBack = false;
    }
  }
}
