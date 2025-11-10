import { SPRITES } from "../../../types/sprites.enum";
import { engine } from "../../engine";

export function loadMapSprites(): void {
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

  engine.loadSprite("room001", "./assets/maps/room-001/image.png");
  engine.loadSprite("room002", "./assets/maps/room-002/image.png");
}
