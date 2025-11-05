import { COLORS } from "../types/colors.enum";
import type { Engine } from "../types/engine.interface";

export function createNotificationBox(engine: Engine, content: string) {
  const container = engine.make([
    engine.rect(480, 100),
    engine.color(engine.Color.fromHex(COLORS.BACKGROUND_PRIMARY)),
    engine.fixed(),
    engine.pos(engine.center()),
    engine.area(),
    engine.anchor("center"),
    {
      close() {
        engine.destroy(container);
      },
    },
  ]);
  container.add([
    engine.text(content, {
      font: "glyphmesss",
      size: 24,
    }),
    engine.color(engine.Color.fromHex("#eacfba")),
    engine.area(),
    engine.anchor("center"),
  ]);

  return container;
}
