import type { Engine } from "../types/engine";

interface FocusableButtonOptions {
  label: string;
  width: number;
  height: number;
  onSelect: () => void;
}

export function createFocusableButton(
  engine: Engine,
  opts: FocusableButtonOptions
) {
  const { label, width, height, onSelect } = opts;
  const baseColor = engine.Color.fromHex("#ffffff");
  const focusColor = engine.Color.fromHex("#ffe28a");
  const bgNormal = engine.Color.fromHex("#2b2e4a");
  const bgFocused = engine.Color.fromHex("#3a3f6b");

  const bg = engine.add([
    engine.rect(width, height),
    engine.color(bgNormal),
    engine.opacity(0.9),
    engine.area(),
    engine.anchor("center"),
    engine.pos(0, 0),
  ]);

  const text = bg.add([
    engine.text(label, { size: 12, font: "glyphmesss", align: "center" }),
    engine.color(baseColor),
    engine.anchor("center"),
    engine.pos(0, 0),
    engine.scale(engine.vec2(1, 1)),
  ]);

  let focused = false;

  function applyFocus(f: boolean) {
    bg.color = f ? bgFocused : bgNormal;
    text.color = f ? focusColor : baseColor;
    text.scale = f ? engine.vec2(1.05, 1.05) : engine.vec2(1, 1);
  }

  function focus() {
    focused = true;
    applyFocus(true);
  }

  function blur() {
    focused = false;
    applyFocus(false);
  }

  function select() {
    onSelect();
  }

  bg.onHover(() => {
    focus();
  });

  bg.onClick(() => {
    select();
  });

  // @ts-expect-error
  bg.focus = focus;
  // @ts-expect-error
  bg.blur = blur;
  // @ts-expect-error
  bg.select = select;
  // @ts-expect-error
  bg.isFocused = () => focused;

  return bg;
}
