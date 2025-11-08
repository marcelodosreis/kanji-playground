import { createBaseButton } from "./base-button";

import { applyFocusState } from "./focus-state";
import { bindHoverTriggers } from "./hover";
import { bindClickHandler } from "./click";
import type { Engine, EngineGameObj } from "../../../types/engine.type";
import { createMenuText } from "../create-menu-text";

export interface MenuButton extends EngineGameObj {
  focus: () => void;
  blur: () => void;
  select: () => void;
  isFocused: () => boolean;
}
export interface MenuButtonOptions {
  label: string;
  width: number;
  height: number;
  onSelect: () => void;
  labelSize?: number;
  baseColorHex?: string;
  focusColorHex?: string;
  bgNormalHex?: string;
  bgFocusedHex?: string;
  opacity?: number;
}

export function createMenuButtons(
  engine: Engine,
  opts: MenuButtonOptions
): MenuButton {
  const {
    label,
    width,
    height,
    onSelect,
    labelSize = 12,
    baseColorHex = "#ffffff",
    focusColorHex = "#ffe28a",
    bgNormalHex = "#44544a",
    bgFocusedHex = "#629e56",
    opacity = 0.9,
  } = opts;

  const bg = createBaseButton(engine, width, height, {
    anchor: "center",
    x: 0,
    y: 0,
    opacity,
  });
  bg.color = engine.Color.fromHex(bgNormalHex);

  const text = createMenuText(engine, label, {
    size: labelSize,
    colorHex: baseColorHex,
    parent: bg,
  });

  let focused = false;

  function focus() {
    focused = true;
    applyFocusState(engine, bg, text, true, {
      baseColorHex,
      focusColorHex,
      bgNormalHex,
      bgFocusedHex,
    });
  }

  function blur() {
    focused = false;
    applyFocusState(engine, bg, text, false, {
      baseColorHex,
      focusColorHex,
      bgNormalHex,
      bgFocusedHex,
    });
  }

  function select() {
    onSelect();
  }

  bindHoverTriggers(bg);
  bindClickHandler(bg, select);
  applyFocusState(engine, bg, text, false, {
    baseColorHex,
    focusColorHex,
    bgNormalHex,
    bgFocusedHex,
  });

  const btn = bg as unknown as MenuButton;
  btn.focus = focus;
  btn.blur = blur;
  btn.select = select;
  btn.isFocused = () => focused;

  return btn;
}
