import type { Engine } from "../types/engine.type";
import { createMenuButtons, type MenuButton } from "../utils/menu/create-menu-button";
import { createMenuText } from "../utils/menu/create-menu-text";
import { setBackgroundColor } from "../utils/set-background-color";

type MenuItem = {
  label: string;
  action: () => void;
};

type Config = {
  bgColor: string;
  title: string;
  subtitle: string;
  titleSize: number;
  subtitleSize: number;
  buttonWidth: number;
  buttonHeight: number;
  buttonGap: number;
  centerX: number;
  startY: number;
};

type SetupParams = {
  engine: Engine;
  items: MenuItem[];
  config: Config;
};

export class MenuManager {
  private static buttons: MenuButton[] = [];
  private static currentIndex = 0;
  private static keyHandlerCancel?: () => void;

  public static setup({ engine, items, config }: SetupParams): void {
    this.setBackground(engine, config.bgColor);
    this.setupCamera(engine, config.centerX);
    this.addTitle(engine, config.title, config.titleSize, config.centerX);
    this.addSubtitle(
      engine,
      config.subtitle,
      config.subtitleSize,
      config.centerX
    );
    this.buttons = this.createButtons(engine, items, config);
    this.setupInput(engine);
  }

  private static setBackground(engine: Engine, bgColor: string): void {
    setBackgroundColor(engine, bgColor);
  }

  private static setupCamera(engine: Engine, centerX: number): void {
    engine.camScale(1);
    engine.camPos(centerX, 180);
  }

  private static addTitle(
    engine: Engine,
    title: string,
    size: number,
    centerX: number
  ): void {
    createMenuText(engine, title, {
      size,
      pos: { x: centerX, y: 60 },
      colorHex: "#ffffff",
    });
  }

  private static addSubtitle(
    engine: Engine,
    subtitle: string,
    size: number,
    centerX: number
  ): void {
    createMenuText(engine, subtitle, {
      size,
      pos: { x: centerX, y: 90 },
      colorHex: "#c7c9ff",
      opacity: 0.85,
    });
  }

  private static createButtons(
    engine: Engine,
    items: MenuItem[],
    config: Config
  ): MenuButton[] {
    return items.map((item, i) => {
      const btn = createMenuButtons(engine, {
        label: item.label,
        width: config.buttonWidth,
        height: config.buttonHeight,
        onSelect: item.action,
      });
      const y = config.startY + i * (config.buttonHeight + config.buttonGap);
      btn.pos = engine.vec2(config.centerX, y);
      btn.anchor = "center";
      this.setupButtonHoverEvents(btn, i);
      return btn;
    });
  }

  private static setupButtonHoverEvents(
    button: MenuButton,
    index: number
  ): void {
    button.on("hoverenter", () => {
      this.currentIndex = index;
      this.updateFocus();
    });
    button.on("hoverleave", () => {
      this.updateFocus();
    });
  }

  private static setupInput(engine: Engine): void {
    this.updateFocus();

    this.keyHandlerCancel = engine.onKeyPress((key) => {
      switch (key) {
        case "up":
          this.moveFocusUp();
          break;
        case "down":
          this.moveFocusDown();
          break;
        case "enter":
          this.selectCurrentButton();
          break;
      }
    }).cancel;

    engine.onSceneLeave(() => {
      if (this.keyHandlerCancel) {
        this.keyHandlerCancel();
        this.keyHandlerCancel = undefined;
      }
    });
  }

  private static updateFocus(): void {
    this.buttons.forEach((btn, i) => {
      if (i === this.currentIndex) btn.focus();
      else btn.blur();
    });
  }

  private static moveFocusUp(): void {
    this.currentIndex =
      (this.currentIndex - 1 + this.buttons.length) % this.buttons.length;
    this.updateFocus();
  }

  private static moveFocusDown(): void {
    this.currentIndex = (this.currentIndex + 1) % this.buttons.length;
    this.updateFocus();
  }

  private static selectCurrentButton(): void {
    this.buttons[this.currentIndex].select();
  }
}
