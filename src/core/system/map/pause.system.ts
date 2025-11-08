import type { Engine, EngineGameObj } from "../../../types/engine.interface";
import { GLOBAL_STATE } from "../../../types/state.interface";
import { createNotification } from "../../../utils/create-notification";
import { GLOBAL_STATE_CONTROLLER } from "../../global-state-controller";

type PauseSystemParams = {
  engine: Engine;
};

export function PauseSystem({ engine }: PauseSystemParams): void {
  let pauseNotificationObj: EngineGameObj | null = null;

  const togglePause = (): void => {
    GLOBAL_STATE_CONTROLLER.set(
      GLOBAL_STATE.IS_PAUSED,
      !GLOBAL_STATE_CONTROLLER.current().isPaused
    );
    if (GLOBAL_STATE_CONTROLLER.current().isPaused) showPauseNotification();
    else hidePauseNotification();
  };

  const showPauseNotification = (): void => {
    const notification = createNotification(
      engine,
      "PAUSED\n\nPress ESC to resume"
    );
    pauseNotificationObj = engine.add(notification);
  };

  const hidePauseNotification = (): void => {
    if (pauseNotificationObj) {
      engine.destroy(pauseNotificationObj);
      pauseNotificationObj = null;
    }
  };

  engine.onKeyPress((key: string) => {
    if (key.toLowerCase() === "escape") togglePause();
  });
}
