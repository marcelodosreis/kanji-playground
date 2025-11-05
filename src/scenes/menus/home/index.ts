import type { Engine } from "../../../types/engine.interface";
import { MenuManager } from "../../../core/manager/menu.manager";
import { setBackgroundColor } from "../../../utils/set-background-color";
import { LEVEL_SCENES, MENU_SCENES } from "../../../types/scenes.enum";
import { COLORS } from "../../../types/colors.enum";

const CONFIG = {
  bgColor: COLORS.BACKGROUND_PRIMARY,
  title: "KANJI - PLAYGROUND",
  subtitle: "Arrow keys to navigate • Enter to select • Click to choose",
  titleSize: 24,
  subtitleSize: 12,
  buttonWidth: 220,
  buttonHeight: 28,
  buttonGap: 14,
  centerX: 320,
  startY: 140,
};

type HomeMenuSceneParams = {
  engine: Engine;
};

export class HomeMenuScene {
  private engine: Engine;
  private config = CONFIG;

  constructor(params: HomeMenuSceneParams) {
    this.engine = params.engine;
    this.initialize();
  }

  public initialize(): void {
    setBackgroundColor(this.engine, this.config.bgColor);

    const items = [
      {
        label: "Start Game",
        action: () => this.engine.go(LEVEL_SCENES.ROOM_001, { exitName: null }),
      },
      { label: "Controls", action: () => this.engine.go(MENU_SCENES.CONTROLS) },
      { label: "Quit", action: () => {} },
    ];

    MenuManager.setup({
      engine: this.engine,
      items,
      config: this.config,
    });
  }
}
