import type { Engine } from "../../../types/engine.interface";
import { MenuManager } from "../../../core/manager/menu.manager";
import { setBackgroundColor } from "../../../utils/set-background-color";
import { MENU_SCENES } from "../../../types/scenes.enum";

const CONFIG = {
  bgColor: "#442b40",
  title: "CONTROLS",
  subtitle: "Remap and options",
  titleSize: 24,
  subtitleSize: 12,
  buttonWidth: 260,
  buttonHeight: 28,
  buttonGap: 14,
  centerX: 320,
  startY: 150,
};

type ControlsMenuSceneParams = {
  engine: Engine;
};

export class ControlsMenuScene {
  private engine: Engine;
  private config = CONFIG;

  constructor(params: ControlsMenuSceneParams) {
    this.engine = params.engine;
    this.initialize();
  }

  public initialize(): void {
    setBackgroundColor(this.engine, this.config.bgColor);

    const items = [
      { label: "Remap Keys", action: () => {} },
      { label: "Reset To Default", action: () => {} },
      { label: "Back", action: () => this.engine.go(MENU_SCENES.HOME) },
    ];

    MenuManager.setup({
      engine: this.engine,
      items,
      config: this.config,
    });
  }
}
