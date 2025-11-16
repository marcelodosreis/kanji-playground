import { engine } from "../../engine";

export function loadUiAssets(): void {
  engine.loadFont("glyphmesss", "./v2/fonts/glyphmesss.ttf");

  engine.loadSpriteAtlas("./v2/assets/sprites/HUD/health-bar.png", {
    healthBar: {
      x: 0,
      y: 0,
      width: 128,
      height: 256,
      sliceY: 4,
      sliceX: 1,
    },
  });
}
