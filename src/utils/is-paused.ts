import { GLOBAL_STATE_CONTROLLER } from "../core/global-state-controller";
import { GLOBAL_STATE } from "../types/global-state.enum";

export const isPaused = () => {
  return GLOBAL_STATE_CONTROLLER.current()[GLOBAL_STATE.IS_PAUSED];
};
