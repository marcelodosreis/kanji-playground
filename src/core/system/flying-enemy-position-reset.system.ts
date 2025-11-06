import type { Enemy } from "../../types/enemy.interface";

type Params = { enemy: Enemy };

export function FlyingEnemyPositionResetSystem({ enemy }: Params) {
  function onExitScreen() {
    if (enemy.pos.dist(enemy.initialPos) > 400) {
      enemy.pos = enemy.initialPos;
    }
  }

  enemy.onExitScreen(onExitScreen);
}
