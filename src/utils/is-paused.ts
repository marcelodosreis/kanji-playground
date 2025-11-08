import { GLOBAL_STATE_CONTROLLER } from "../core/global-state-controller";

export const isPaused = () => GLOBAL_STATE_CONTROLLER.current().isPaused;
