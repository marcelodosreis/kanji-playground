import { COLORS } from "../../../types/colors.enum";
import type { Engine } from "../../../types/engine.interface";
import { createNotification } from "../../../utils/create-notification";
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
    setBackgroundColor(this.engine, COLORS.BACKGROUND_PRIMARY);
    this.engine.add(
      createNotification(
        this.engine,
        "You escaped the factory!\n The End. Thanks for playing!"
      )
    );
  }
}
