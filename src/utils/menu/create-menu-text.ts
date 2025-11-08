import type { Anchor } from "kaplay";
import type { Engine, EngineGameObj } from "../../types/engine.interface";

export interface MenuTextOptions {
  size?: number;
  colorHex?: string;
  font?: string;
  align?: "left" | "center" | "right";
  pos?: { x: number; y: number };
  anchor?: Anchor;
  scale?: { x: number; y: number };
  opacity?: number;
  parent?: any;
}

export function createMenuText(
  engine: Engine,
  text: string,
  options: MenuTextOptions = {}
): EngineGameObj {
  const {
    size = 12,
    colorHex = "#ffffff",
    font = "glyphmesss",
    align = "center",
    pos = { x: 0, y: 0 },
    anchor = "center",
    scale = { x: 1, y: 1 },
    opacity,
    parent = undefined,
  } = options;

  const components: any[] = [
    engine.text(text, { size, font, align }),
    engine.color(engine.Color.fromHex(colorHex)),
    engine.anchor(anchor),
    engine.pos(pos.x, pos.y),
    engine.scale(engine.vec2(scale.x, scale.y)),
  ];

  if (opacity !== undefined) {
    components.push(engine.opacity(opacity));
  }

  const target = parent ?? engine;
  const entity = target.add(components) as EngineGameObj;
  return entity;
}