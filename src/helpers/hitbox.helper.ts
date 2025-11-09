import type { Engine, EngineGameObj } from "../types/engine.type";

type HitboxOwner = EngineGameObj;

type TransientHitboxConfig = {
  engine: Engine;
  owner: HitboxOwner;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  tag?: string;
  collideWithTag?: string;
  onCollide?: (other: EngineGameObj) => void;
};

export function createTransientHitbox(config: TransientHitboxConfig) {
  const {
    engine,
    owner,
    width,
    height,
    offsetX,
    offsetY,
    tag = "HITBOX_DEFAULT",
    collideWithTag,
    onCollide,
  } = config;

  const shape = new engine.Rect(engine.vec2(0), width, height);

  const hitbox = owner.add([
    engine.pos(offsetX, offsetY),
    engine.area({ shape }),
    tag,
  ]) as EngineGameObj;

  if (collideWithTag && typeof onCollide === "function") {
    hitbox.onCollide(collideWithTag, (other: EngineGameObj) => {
      try {
        onCollide(other);
      } catch (e) {}
    });
  }

  function destroy() {
    try {
      if (typeof (hitbox).destroy === "function") {
        (hitbox).destroy();
      } else {
        engine.destroy(hitbox);
      }
    } catch (e) {}
  }

  return { hitbox, destroy };
}
