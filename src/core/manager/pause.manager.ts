import type { Engine } from "../../types/engine.type";
import { GLOBAL_STATE } from "../../types/global-state.enum";
import { isPausedAtom, store } from "../../store";
import { GLOBAL_STATE_CONTROLLER } from "../global-state-controller";

type PauseManagerParams = { engine: Engine };

export class PauseManager {
  private readonly engine: Engine;

  private constructor(params: PauseManagerParams) {
    this.engine = params.engine;
  }

  public static setup(params: PauseManagerParams): PauseManager {
    const manager = new PauseManager(params);
    manager.initialize();
    return manager;
  }

  private initialize(): void {
    this.listenForPauseToggle();
  }

  private listenForPauseToggle(): void {
    this.engine.onKeyPress((key: string) => {
      if (key.toLowerCase() === "escape") this.togglePause();
    });
  }

  private togglePause(): void {
    const current = GLOBAL_STATE_CONTROLLER.current().isPaused;
    GLOBAL_STATE_CONTROLLER.set(GLOBAL_STATE.IS_PAUSED, !current);

    store.set(isPausedAtom, (prev) => !prev);
  }
}
