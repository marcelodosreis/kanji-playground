import { engine } from "../../engine";

export function loadUiAssets(): void {
  engine.loadFont("glyphmesss", "./v2/fonts/glyphmesss.ttf");

  engine.loadSpriteAtlas("./assets/ui.png", {
    healthBar: {
      x: 16,
      y: 16,
      width: 60,
      height: 48,
      sliceY: 3,
    },
  });
}
