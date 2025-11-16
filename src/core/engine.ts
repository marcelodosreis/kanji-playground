import kaplay from "kaplay";
import type { Engine } from "../types/engine.type";
import { GAME } from "../constansts/game.constant";

export const engine: Engine = kaplay({
  canvas: document.getElementById("game") as HTMLCanvasElement,
  width: GAME.WIDTH,
  height: GAME.HEIGHT,
  scale: GAME.SCALE,

  letterbox: false,
  touchToMouse: true,
  pixelDensity: devicePixelRatio,
  debug: true,
  background: [0, 0, 0, 0],
});
