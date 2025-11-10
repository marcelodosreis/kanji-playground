import {
  BURNER_ANIMATIONS,
  FLYING_ANIMATIONS,
} from "../../../types/animations.enum";
import { FLYING_ENEMY_SPRITES, SPRITES } from "../../../types/sprites.enum";
import { engine } from "../../engine";

export function loadEnemiesSprites(): void {
  engine.loadSprite(
    FLYING_ENEMY_SPRITES.PURPLE,
    "./v2/assets/sprites/enemies/purple-bat.png",
    {
      sliceX: 5,
      sliceY: 3,
      anims: {
        [FLYING_ANIMATIONS.EXPLODE]: { from: 6, to: 7 },
        [FLYING_ANIMATIONS.HURT]: { from: 6, to: 7, speed: 16 },
        [FLYING_ANIMATIONS.FLYING]: { from: 10, to: 14, loop: true },
      },
    }
  );

  engine.loadSprite(
    FLYING_ENEMY_SPRITES.ORANGE,
    "./v2/assets/sprites/enemies/orange-bat.png",
    {
      sliceX: 5,
      sliceY: 3,
      anims: {
        [FLYING_ANIMATIONS.EXPLODE]: { from: 6, to: 7 },
        [FLYING_ANIMATIONS.HURT]: { from: 6, to: 7, speed: 16 },
        [FLYING_ANIMATIONS.FLYING]: { from: 10, to: 14, loop: true },
      },
    }
  );

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
}
