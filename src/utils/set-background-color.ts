import type { Engine } from "../lib/engine";

export function setBackgroundColor(engine: Engine, hex: string) {
  engine.add([
    engine.rect(engine.width(), engine.height()),
    engine.color(engine.Color.fromHex(hex)),
    engine.fixed(),
  ]);
}
