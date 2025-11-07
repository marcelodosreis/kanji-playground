import { state } from "../core/global-state-controller";

export const isPaused = () => state.current().isPaused;

export function wrapWithPauseCheck(callback: () => void) {
  return () => {
    if (!isPaused()) {
      callback();
    }
  };
}
