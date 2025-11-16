import type { Engine } from "../types/engine.type";
import { effect } from "../utils/effect.utils";

type HitConfirmParams = {
  engine: Engine;
  position: { x: number; y: number };
  isRight: boolean;
  scale?: number;
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

  const front = effect({
    engine,
    sprite: FRONT,
    x: position.x + frontOffset,
    y: position.y,
    scale,
    rotate: frontRot,
    z: 100,
  });

  const back = effect({
    engine,
    sprite: BACK,
    x: position.x + backOffset,
    y: position.y,
    scale,
    rotate: backRot,
    z: 99,
  });

  front.play(ANIM);
  back.play(ANIM);

  const done = () => {
    front.destroy();
    back.destroy();
  };

  front.onAnimEnd(done);
  back.onAnimEnd(done);
}
