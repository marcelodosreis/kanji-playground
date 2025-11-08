import {
  BURNER_ANIMATIONS,
  BAT_ANIMATIONS,
  PLAYER_ANIMATIONS,
  SPRITES,
} from "../../types/animations.enum";
import { engine } from "../engine";

export function sprites(): void {
  engine.loadFont("glyphmesss", "./fonts/glyphmesss.ttf");

  engine.loadSprite(SPRITES.PLAYER, "./v2/assets/sprites/player.png", {
    sliceX: 8,
    sliceY: 14,
    anims: {
      [PLAYER_ANIMATIONS.IDLE]: { from: 0, to: 7, loop: true },
      [PLAYER_ANIMATIONS.ATTACK]: { from: 8, to: 13, speed: 18 },
      // [PLAYER_ANIMATIONS.ATTACK_BOTTOM]: { from: 16, to: 21, speed: 16 },
      [PLAYER_ANIMATIONS.HURT]: { from: 32, to: 33, speed: 32 },
      // [PLAYER_ANIMATIONS.ACHIVE]: { from: 40, to: 45, speed: 10 },
      [PLAYER_ANIMATIONS.RUN]: { from: 48, to: 52, loop: true },
      // [PLAYER_ANIMATIONS.DASH]: { from: 56, to: 61, speed: 18 },
      [PLAYER_ANIMATIONS.JUMP]: { from: 64, to: 68, speed: 24 },
      // [PLAYER_ANIMATIONS.DEFENSE]: { from: 72, to: 75, speed: 8 },
      [PLAYER_ANIMATIONS.FALL]: { from: 80, to: 80, loop: true },
      // [PLAYER_ANIMATIONS.WALL]: { from: 88, to: 88, loop: true },
      // [PLAYER_ANIMATIONS.SPELL]: { from: 96, to: 99 },
      [PLAYER_ANIMATIONS.EXPLODE]: { from: 104, to: 109 },
    },
  });

  engine.loadSprite(SPRITES.BAT, "./v2/assets/sprites/bat.png", {
    sliceX: 5,
    sliceY: 3,
    anims: {
      [BAT_ANIMATIONS.EXPLODE]: { from: 6, to: 7 },
      [BAT_ANIMATIONS.HURT]: { from: 6, to: 7, speed: 16 },
      [BAT_ANIMATIONS.FLYING]: { from: 10, to: 14, loop: true },
    },
  });

  engine.loadSprite(SPRITES.BURNER, "./assets/sprites/burner.png", {
    sliceX: 5,
    sliceY: 6,
    anims: {
      [BURNER_ANIMATIONS.IDLE]: { from: 0, to: 3, loop: true },
      [BURNER_ANIMATIONS.RUN]: { from: 6, to: 8, loop: true },
      [BURNER_ANIMATIONS.OPEN_FIRE]: { from: 10, to: 14 },
      [BURNER_ANIMATIONS.FIRE]: { from: 15, to: 18, loop: true },
      [BURNER_ANIMATIONS.SHUT_FIRE]: { from: 20, to: 23 },
      [BURNER_ANIMATIONS.EXPLODE]: { from: 25, to: 29 },
    },
  });

  engine.loadSpriteAtlas("./assets/ui.png", {
    healthBar: {
      x: 16,
      y: 16,
      width: 60,
      height: 48,
      sliceY: 3,
    },
  });

  engine.loadSpriteAtlas("./assets/animations.png", {
    [SPRITES.CARTRIDGE]: {
      x: 125,
      y: 145,
      width: 134,
      height: 16,
      sliceX: 8,
      anims: {
        default: { from: 0, to: 4, loop: true, speed: 7 },
      },
    },
  });

  engine.loadSprite("tileset", "./assets/tileset.png", {
    sliceX: 33,
    sliceY: 21,
  });

  engine.loadSprite("background", "./assets/background.png", {
    sliceX: 13,
    sliceY: 25,
  });

  engine.loadSprite("room001", "./assets/maps/room-001/image.png");
  engine.loadSprite("room002", "./assets/maps/room-002/image.png");
}
