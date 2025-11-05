import {
  BURNER_ANIMATIONS,
  DRONE_ANIMATIONS,
  PLAYER_ANIMATIONS,
} from "../types/animations.enum";
import { engine } from "./engine";

export function sprites(): void {
  engine.loadFont("glyphmesss", "./fonts/glyphmesss.ttf");

  engine.loadSprite("player", "./assets/sprites/player.png", {
    sliceX: 8,
    sliceY: 9,
    anims: {
      [PLAYER_ANIMATIONS.IDLE]: { from: 0, to: 7, loop: true },
      [PLAYER_ANIMATIONS.RUN]: { from: 8, to: 13, loop: true },
      [PLAYER_ANIMATIONS.JUMP]: { from: 51, to: 51, loop: true },
      [PLAYER_ANIMATIONS.FALL]: { from: 54, to: 54, loop: true },
      [PLAYER_ANIMATIONS.EXPLODE]: { from: 64, to: 69 },
      [PLAYER_ANIMATIONS.ATTACK]: { from: 24, to: 28, speed: 16 },
    },
  });

  engine.loadSprite("drone", "./assets/sprites/drone.png", {
    sliceX: 6,
    sliceY: 3,
    anims: {
      [DRONE_ANIMATIONS.FLYING]: { from: 0, to: 3, loop: true },
      [DRONE_ANIMATIONS.ATTACK]: { from: 6, to: 11, loop: true },
      [DRONE_ANIMATIONS.EXPLODE]: { from: 12, to: 17 },
    },
  });

  engine.loadSprite("burner", "./assets/sprites/burner.png", {
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
    cartridge: {
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
