import { PLAYER_ANIMATIONS } from "../../../types/animations.enum";
import { SPRITES } from "../../../types/sprites.enum";
import { engine } from "../../engine";

export function loadPlayerSprites(): void {
  engine.loadSprite(SPRITES.PLAYER, "./v2/assets/sprites/player.png", {
    sliceX: 8,
    sliceY: 14,
    anims: {
      [PLAYER_ANIMATIONS.IDLE]: { from: 0, to: 7, loop: true },
      [PLAYER_ANIMATIONS.ATTACK]: { from: 8, to: 13, speed: 32 },
      // [PLAYER_ANIMATIONS.ATTACK_BOTTOM]: { from: 16, to: 21, speed: 16 },
      [PLAYER_ANIMATIONS.HURT]: { from: 32, to: 33, speed: 32 },
      // [PLAYER_ANIMATIONS.ACHIVE]: { from: 40, to: 45, speed: 10 },
      [PLAYER_ANIMATIONS.RUN]: { from: 48, to: 52, loop: true, speed: 12 },
      // [PLAYER_ANIMATIONS.DASH]: { from: 56, to: 61, speed: 18 },
      [PLAYER_ANIMATIONS.JUMP]: { from: 64, to: 68, speed: 32 },
      // [PLAYER_ANIMATIONS.DEFENSE]: { from: 72, to: 75, speed: 8 },
      [PLAYER_ANIMATIONS.FALL]: { from: 80, to: 80, loop: true },
      // [PLAYER_ANIMATIONS.WALL]: { from: 88, to: 88, loop: true },
      // [PLAYER_ANIMATIONS.SPELL]: { from: 96, to: 99 },
      [PLAYER_ANIMATIONS.EXPLODE]: { from: 104, to: 109 },
    },
  });

  engine.loadSprite("slash-effect", "./v2/assets/sprites/effects/slash.png", {
    sliceX: 3,
    sliceY: 1,
    anims: {
      slash: {
        from: 0,
        to: 2,
        speed: 32,
        loop: false,
      },
    },
  });

  engine.loadSprite("hit-effect", "./v2/assets/sprites/effects/hit.png", {
    sliceX: 7,
    sliceY: 1,
    anims: {
      hit: {
        from: 0,
        to: 6,
        speed: 32,
        loop: false,
      },
    },
  });

    engine.loadSprite("hit-effect-back", "./v2/assets/sprites/effects/hit-02.png", {
    sliceX: 6,
    sliceY: 1,
    anims: {
      hit: {
        from: 0,
        to: 5,
        speed: 32,
        loop: false,
      },
    },
  });
}
