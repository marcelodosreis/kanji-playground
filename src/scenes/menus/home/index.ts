import type { Engine } from "../../../types/engine.type";
import { setBackgroundColor } from "../../../utils/set-background-color";
import { COLORS } from "../../../types/colors.enum";
import { isMainMenuOpened, startGameEvent, store } from "../../../stores";
import { LEVEL_SCENES } from "../../../types/scenes.enum";

type HomeMenuSceneParams = {
  engine: Engine;
};

export class HomeMenuScene {
  private engine;

  constructor(params: HomeMenuSceneParams) {
    this.engine = params.engine;
    this.initialize();
    this.listenUIEvents();
  }

  initialize() {
    setBackgroundColor(this.engine, COLORS.BACKGROUND_PRIMARY);
    store.set(isMainMenuOpened, true);
  }

  listenUIEvents() {
    store.sub(startGameEvent, () => {
      this.onStartGame();
    });
  }

  onStartGame() {
    store.set(isMainMenuOpened, false);
    this.engine.go(LEVEL_SCENES.ROOM_001, { exitName: null });
  }
}
