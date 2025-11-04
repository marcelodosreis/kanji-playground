import type { EngineGameObj } from "./engine.interface";

export interface FocusableButton extends EngineGameObj {
  focus: () => void;
  blur: () => void;
  select: () => void;
  isFocused: () => boolean;
}