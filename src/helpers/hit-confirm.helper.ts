import type { Engine, EngineGameObj } from "../types/engine.type";

type HitConfirmParams = {
  engine: Engine;
  position: { x: number; y: number };
  isRight: boolean;
  scale?: number;
};

type HitEffect = EngineGameObj & {
  play: (anim: string) => void;
  onAnimEnd: (callback: () => void) => void;
};

const FRONT = "hit-effect";
const BACK = "hit-effect-back";
const ANIM = "hit";

export function spawnHitConfirm({
  engine,
  position,
  isRight,
  scale = 1,
}: HitConfirmParams): void {
  const dir = isRight ? 1 : -1;

  const frontOffset = 12 * dir;
  const backOffset = 72 * dir;

  const frontRot = isRight ? 180 : 0;
  const backRot = isRight ? 0 : 180;

  const front = engine.add([
    engine.sprite(FRONT),
    engine.pos(position.x + frontOffset, position.y),
    engine.anchor("center"),
    engine.scale(0.4),
    engine.rotate(frontRot),
    engine.z(100),
  ]) as HitEffect;

  const back = engine.add([
    engine.sprite(BACK),
    engine.pos(position.x + backOffset, position.y),
    engine.anchor("center"),
    engine.scale(scale),
    engine.rotate(backRot),
    engine.z(99),
  ]) as HitEffect;

  front.play(ANIM);
  back.play(ANIM);

  const done = () => {
    front.destroy();
    back.destroy();
  };

  front.onAnimEnd(done);
  back.onAnimEnd(done);
}
