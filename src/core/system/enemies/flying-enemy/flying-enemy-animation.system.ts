import type { Engine } from "../../../../types/engine.type";
import type { Enemy } from "../../../../types/enemy.interface";
import { BAT_ANIMATIONS } from "../../../../types/animations.enum";
import { ENGINE_DEFAULT_EVENTS } from "../../../../types/events.enum";

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

  function onHurt(): void {
    if (enemy.hp() > 0) {
      return enemy.play(BAT_ANIMATIONS.HURT);
    }
    enemy.play(BAT_ANIMATIONS.EXPLODE);
  }

  function onAnimationEnd(anim: string): void {
    if (anim === BAT_ANIMATIONS.EXPLODE) {
      engine.destroy(enemy);
    }
  }

  enemy.on(ENGINE_DEFAULT_EVENTS.HURT, onHurt);
  enemy.onAnimEnd(onAnimationEnd);
}
