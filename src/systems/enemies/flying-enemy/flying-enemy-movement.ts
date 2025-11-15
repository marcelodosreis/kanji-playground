import type { Enemy } from "../../../types/enemy.interface";
import { isPaused } from "../../../utils/is-paused";
import type { FlyingEnemyOrganicMovementSystem } from "./flying-enemy-organic-movement";

type Params = {
  enemy: Enemy;
  organicMovement: ReturnType<typeof FlyingEnemyOrganicMovementSystem>;
};

export function FlyingEnemyMovementSystem({ enemy, organicMovement }: Params) {
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

    organicMovement.setTargetVelocity(direction * enemy.speed, 0);
  }

  function moveToPosition(
    targetX: number,
    targetY: number,
    speed: number
  ): void {
    if (!canMove()) return;
    faceDirection(targetX);

    const dx = targetX - enemy.pos.x;
    const dy = targetY - enemy.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 1) {
      const vx = (dx / distance) * speed;
      const vy = (dy / distance) * speed;
      organicMovement.setTargetVelocity(vx, vy);
    } else {
      organicMovement.setTargetVelocity(0, 0);
    }
  }

  function returnToHeight(targetY: number): void {
    if (!canMove()) return;

    const dy = targetY - enemy.pos.y;
    const distance = Math.abs(dy);

    if (distance > 5) {
      const vy = (dy / distance) * (enemy.speed * 0.4);
      organicMovement.setTargetVelocity(0, vy);
    } else {
      organicMovement.setTargetVelocity(0, 0);
    }
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