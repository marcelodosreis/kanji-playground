import { state } from "../core/state";

export const isPaused = () => state.current().isPaused;

export function wrapWithPauseCheck(callback: () => void) {
  return () => {
    if (!isPaused()) {
      callback();
    }
  };
}
