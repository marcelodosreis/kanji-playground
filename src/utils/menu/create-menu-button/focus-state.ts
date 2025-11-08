import type { Engine } from "../../../types/engine.interface";

export function applyFocusState(
  engine: Engine,
  container: any,
  textObj: any,
  focused: boolean,
  opts?: {
    baseColorHex?: string;
    focusColorHex?: string;
    bgNormalHex?: string;
    bgFocusedHex?: string;
  }
) {
  const baseColor = engine.Color.fromHex(opts?.baseColorHex ?? "#ffffff");
  const focusColor = engine.Color.fromHex(opts?.focusColorHex ?? "#ffe28a");
  const bgNormal = engine.Color.fromHex(opts?.bgNormalHex ?? "#44544a");
  const bgFocused = engine.Color.fromHex(opts?.bgFocusedHex ?? "#629e56");
  
  container.color = focused ? bgFocused : bgNormal;
  textObj.color = focused ? focusColor : baseColor;
  textObj.scale = focused ? engine.vec2(1.2, 1.2) : engine.vec2(1, 1);
}
