import type { Engine } from "../../../types/engine.type";

export function createBaseButton(
  engine: Engine,
  width: number,
  height: number,
  opts?: {
    anchor?: "center" | "topleft";
    x?: number;
    y?: number;
    opacity?: number;
  }
) {
  const anchor = opts?.anchor ?? "topleft";
  const bg = engine.add([
    engine.rect(width, height),
    engine.color(engine.Color.fromHex("#000000")),
    engine.opacity(opts?.opacity ?? 1),
    engine.area(),
    engine.anchor(anchor),
    engine.pos(opts?.x ?? 0, opts?.y ?? 0),
  ]);
  return bg;
}
