import kaplay from "kaplay";

export const engine = kaplay({
  global: false,
  touchToMouse: true,
  canvas: document.getElementById("game") as HTMLCanvasElement,
});
