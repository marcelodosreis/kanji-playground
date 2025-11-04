import kaplay from "kaplay";
import type { Engine } from "../types/engine.interface";

const scale = 1;

export const engine: Engine = kaplay({
  canvas: document.getElementById("game") as HTMLCanvasElement,
  width: 640 * scale,
  height: 360 * scale,
  letterbox: false,
  touchToMouse: true,
  scale,
  pixelDensity: devicePixelRatio,
  debug: true,
});
