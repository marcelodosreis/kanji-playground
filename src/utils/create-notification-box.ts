import type { Engine } from "../types/engine";

export function createNotificationBox(engine: Engine, content: string) {
  const container = engine.make([
    engine.rect(480, 100),
    engine.color(engine.Color.fromHex("#20214a")),
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
      size: 32,
    }),
    engine.color(engine.Color.fromHex("#eacfba")),
    engine.area(),
    engine.anchor("center"),
  ]);

  return container;
}
