import { PLAYER_ANIMATIONS } from "../types/animations.enum";

export class AnimationChecks {
  static isIdle(anim: string): boolean {
    return anim === PLAYER_ANIMATIONS.IDLE;
  }

  static isRun(anim: string): boolean {
    return anim === PLAYER_ANIMATIONS.RUN;
  }

  static isJump(anim: string): boolean {
    return anim === PLAYER_ANIMATIONS.JUMP;
  }

  static isFall(anim: string): boolean {
    return anim === PLAYER_ANIMATIONS.FALL;
  }

  static isAttack(anim: string): boolean {
    return anim === PLAYER_ANIMATIONS.ATTACK;
  }

  static isHurt(anim: string): boolean {
    return anim === PLAYER_ANIMATIONS.HURT;
  }

  static isExplode(anim: string): boolean {
    return anim === PLAYER_ANIMATIONS.EXPLODE;
  }

  static isAerial(anim: string): boolean {
    return this.isJump(anim) || this.isFall(anim);
  }

  static isGroundedLocomotion(anim: string): boolean {
    return this.isIdle(anim) || this.isRun(anim);
  }

  static isLocomotion(anim: string): boolean {
    return (
      this.isIdle(anim) ||
      this.isRun(anim) ||
      this.isJump(anim) ||
      this.isFall(anim)
    );
  }

  static canMove(anim: string): boolean {
    return anim !== PLAYER_ANIMATIONS.EXPLODE;
  }

  static isInCombat(anim: string): boolean {
    return this.isAttack(anim) || this.isHurt(anim);
  }
}

export class AnimationFrameChecks {
  static isAtFrame(currentFrame: number, targetFrame: number): boolean {
    return currentFrame === targetFrame;
  }

  static isAfterFrame(currentFrame: number, targetFrame: number): boolean {
    return currentFrame > targetFrame;
  }

  static isBeforeFrame(currentFrame: number, targetFrame: number): boolean {
    return currentFrame < targetFrame;
  }

  static isBetweenFrames(
    currentFrame: number,
    startFrame: number,
    endFrame: number
  ): boolean {
    return currentFrame >= startFrame && currentFrame <= endFrame;
  }

  static hasReachedFrame(currentFrame: number, targetFrame: number): boolean {
    return currentFrame >= targetFrame;
  }

  static isInFrameRange(
    currentFrame: number,
    startFrame: number,
    endFrame: number
  ): boolean {
    return currentFrame >= startFrame && currentFrame < endFrame;
  }
}
