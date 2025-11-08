import type { Engine, EngineGameObj } from "../../types/engine.interface";
import { GLOBAL_STATE } from "../../types/state.interface";
import { createNotificationBox } from "../../utils/create-notification-box";
import { GLOBAL_STATE_CONTROLLER } from "../global-state-controller";

export class PauseSystem {
  private engine: Engine;
  private pauseNotificationObj: EngineGameObj | null = null;

  static setup(params: { engine: Engine }) {
    return new PauseSystem(params.engine);
  }

  constructor(engine: Engine) {
    this.engine = engine;
    this.engine.onKeyPress((key: string) => {
      if (key.toLowerCase() === "escape") this.togglePause();
    });
  }

  private togglePause(): void {
    GLOBAL_STATE_CONTROLLER.set(
      GLOBAL_STATE.IS_PAUSED,
      !GLOBAL_STATE_CONTROLLER.current().isPaused
    );
    if (GLOBAL_STATE_CONTROLLER.current().isPaused)
      this.showPauseNotification();
    else this.hidePauseNotification();
  }

  private showPauseNotification(): void {
    const notification = createNotificationBox(
      this.engine,
      "PAUSED\n\nPress ESC to resume"
    );
    this.pauseNotificationObj = this.engine.add(notification);
  }

  private hidePauseNotification(): void {
    if (this.pauseNotificationObj) {
      this.engine.destroy(this.pauseNotificationObj);
      this.pauseNotificationObj = null;
    }
  }
}
