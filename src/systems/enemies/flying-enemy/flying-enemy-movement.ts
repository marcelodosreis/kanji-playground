import type { Engine } from "../../../types/engine.type";
import type { Enemy } from "../../../types/enemy.interface";
import { isPaused } from "../../../utils/is-paused";

type Params = {
  engine: Engine;
  enemy: Enemy;
};

export function FlyingEnemyMovementSystem({ engine, enemy }: Params) {
  function canMove(): boolean {
    return enemy.hp() > 0 && !isPaused() && !enemy.isKnockedBack;
  }

  function faceDirection(targetX: number): void {
    enemy.flipX = targetX < enemy.pos.x;
  }

  function faceLeft(): void {
    enemy.flipX = true;
  }

  function faceRight(): void {
    enemy.flipX = false;
  }

  function moveHorizontal(direction: number): void {
    if (!canMove()) return;

    if (direction > 0) {
      faceRight();
    } else if (direction < 0) {
      faceLeft();
    }

    enemy.move(direction * enemy.speed, 0);
  }

  function moveToPosition(
    targetX: number,
    targetY: number,
    speed: number
  ): void {
    if (!canMove()) return;
    faceDirection(targetX);
    enemy.moveTo(engine.vec2(targetX, targetY), speed);
  }

  function returnToHeight(targetY: number): void {
    if (!canMove()) return;
    enemy.moveTo(engine.vec2(enemy.pos.x, targetY), enemy.speed);
  }

  return {
    canMove,
    faceDirection,
    faceLeft,
    faceRight,
    moveHorizontal,
    moveToPosition,
    returnToHeight,
  };
}
