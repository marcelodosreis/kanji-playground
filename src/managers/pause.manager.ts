import type { Engine } from "../types/engine.type";
import { isPausedAtom, store } from "../stores";

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
    store.set(isPausedAtom, (prev) => !prev);
  }
}
