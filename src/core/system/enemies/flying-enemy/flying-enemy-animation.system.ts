import type { Engine } from "../../../../types/engine.interface";
import type { Enemy } from "../../../../types/enemy.interface";
import { BAT_ANIMATIONS } from "../../../../types/animations.enum";

type Params = {
  engine: Engine;
  enemy: Enemy;
};

export function FlyingEnemyAnimationSystem({ engine, enemy }: Params) {
  engine.onUpdate(() => {
    if (!enemy.curAnim()) {
      enemy.play(BAT_ANIMATIONS.FLYING);
    }
  });

  function onAnimationEnd(anim: string): void {
    if (anim === BAT_ANIMATIONS.EXPLODE) {
      engine.destroy(enemy);
    }
  }

  enemy.onAnimEnd(onAnimationEnd);
}
