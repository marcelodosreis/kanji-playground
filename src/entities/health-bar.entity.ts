import type { Engine, EngineGameObj } from "../types/engine.type";

const HEALTH_BAR_CONFIG = {
  sprite: "healthBar",
  position: { x: 16, y: -16 },
  scale: 2,
};

export function HealthBarEntity(engine: Engine): EngineGameObj {
  return engine.make([
    engine.sprite(HEALTH_BAR_CONFIG.sprite, { frame: 0 }),
    engine.fixed(),
    engine.pos(HEALTH_BAR_CONFIG.position.x, HEALTH_BAR_CONFIG.position.y),
    engine.scale(HEALTH_BAR_CONFIG.scale),
  ]);
}
