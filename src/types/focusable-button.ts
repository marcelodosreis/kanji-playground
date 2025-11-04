import type { EngineGameObj } from "./engine";

export interface FocusableButton extends EngineGameObj {
  focus: () => void;
  blur: () => void;
  select: () => void;
  isFocused: () => boolean;
}