import type { Engine } from "../../../types/engine";
import { createNotificationBox } from "../../../utils/create-notification-box";
import { setBackgroundColor } from "../../../utils/set-background-color";

type FinalExitSceneParams = {
  engine: Engine;
};

export class FinalExitScene {
  private engine: Engine;

  constructor(params: FinalExitSceneParams) {
    this.engine = params.engine;
    this.initialize();
  }

  private initialize(): void {
    setBackgroundColor(this.engine, "#20214a");
    this.engine.add(
      createNotificationBox(
        this.engine,
        "You escaped the factory!\n The End. Thanks for playing!"
      )
    );
  }
}
