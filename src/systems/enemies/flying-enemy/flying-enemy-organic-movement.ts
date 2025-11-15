import type { Engine } from "../../../types/engine.type";
import type { Enemy } from "../../../types/enemy.interface";
import { isPaused } from "../../../utils/is-paused";

type OrganicMovementParams = {
  engine: Engine;
  enemy: Enemy;
};

export function FlyingEnemyOrganicMovementSystem({
  engine,
  enemy,
}: OrganicMovementParams) {
  let velocityX = 0;
  let velocityY = 0;
  let targetVelocityX = 0;
  let targetVelocityY = 0;

  const ACCELERATION = 2;
  const DECELERATION = 4;
  const MAX_SPEED = enemy.speed * 1.2;

  let breatheTime = Math.random() * Math.PI * 2;
  const BREATHE_SPEED = 1.6;
  const BREATHE_AMPLITUDE_Y = 0.6;
  const BREATHE_AMPLITUDE_X = 0.4;

  let dragTime = 0;
  const DRAG_DURATION = 0.15;
  let isDragging = false;

  function lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
  }

  function updateBreathing(): { x: number; y: number } {
    breatheTime += engine.dt() * BREATHE_SPEED;

    const breatheY = Math.sin(breatheTime) * BREATHE_AMPLITUDE_Y;
    const breatheX = Math.sin(breatheTime * 0.7) * BREATHE_AMPLITUDE_X;

    return { x: breatheX, y: breatheY };
  }

  function updateVelocity(): void {
    const accelRate =
      Math.abs(targetVelocityX) > 0.1 || Math.abs(targetVelocityY) > 0.1
        ? ACCELERATION
        : DECELERATION;

    const lerpFactor = Math.min(1, engine.dt() * accelRate);

    velocityX = lerp(velocityX, targetVelocityX, lerpFactor);
    velocityY = lerp(velocityY, targetVelocityY, lerpFactor);

    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    if (speed > MAX_SPEED) {
      const scale = MAX_SPEED / speed;
      velocityX *= scale;
      velocityY *= scale;
    }
  }

  function applyDrag(): void {
    if (isDragging) {
      dragTime += engine.dt();
      const dragFactor = Math.min(1, dragTime / DRAG_DURATION);
      const easedDrag = 1 - Math.pow(1 - dragFactor, 3);

      velocityX *= 1 - easedDrag * 0.5;

      if (dragTime >= DRAG_DURATION) {
        isDragging = false;
        dragTime = 0;
      }
    }
  }

  function setTargetVelocity(vx: number, vy: number): void {
    const wasMovingOpposite =
      (targetVelocityX > 0 && vx < 0) || (targetVelocityX < 0 && vx > 0);

    if (wasMovingOpposite && Math.abs(vx) > 10) {
      isDragging = true;
      dragTime = 0;
    }

    targetVelocityX = vx;
    targetVelocityY = vy;
  }

  function getCurrentVelocity(): { x: number; y: number } {
    return { x: velocityX, y: velocityY };
  }

  function resetVelocity(): void {
    velocityX = 0;
    velocityY = 0;
    targetVelocityX = 0;
    targetVelocityY = 0;
    isDragging = false;
    dragTime = 0;
  }

  function applyMovement(): void {
    if (enemy.hp() <= 0 || isPaused()) {
      targetVelocityX = 0;
      targetVelocityY = 0;
      velocityX = 0;
      velocityY = 0;
      return;
    }

    if (enemy.isKnockedBack) {
      velocityX = 0;
      velocityY = 0;
      targetVelocityX = 0;
      targetVelocityY = 0;
      return;
    }

    updateVelocity();
    applyDrag();

    const breathe = updateBreathing();

    const finalVelocityX = velocityX + breathe.x * 20;
    const finalVelocityY = velocityY + breathe.y * 20;

    enemy.move(finalVelocityX, finalVelocityY);
  }

  engine.onUpdate(() => {
    applyMovement();
  });

  return {
    setTargetVelocity,
    getCurrentVelocity,
    resetVelocity,
  };
}
