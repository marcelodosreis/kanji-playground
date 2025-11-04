import type { Engine } from "../../types/engine";
import type { FocusableButton } from "../../types/focusable-button";
import { createFocusableButton } from "../../utils/create-focusable-button";
import { setBackgroundColor } from "../../utils/set-background-color";

type MenuItem = {
  label: string;
  action: () => void;
};

type SetupParams = {
  engine: Engine;
  items: MenuItem[];
  config: {
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
};

export class MenuManager {
  static setup(params: SetupParams): void {
    this.setBackground(params.engine, params.config.bgColor);
    this.setupCamera(params.engine, params.config.centerX);
    this.addTitle(
      params.engine,
      params.config.title,
      params.config.titleSize,
      params.config.centerX
    );
    this.addSubtitle(
      params.engine,
      params.config.subtitle,
      params.config.subtitleSize,
      params.config.centerX
    );
    const buttons = this.createButtons(
      params.engine,
      params.items,
      params.config
    );
    this.setupInput(params.engine, buttons);
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
    engine.add([
      engine.pos(centerX, 60),
      engine.anchor("center"),
      engine.text(title, { size, font: "glyphmesss", align: "center" }),
      engine.color(engine.Color.fromHex("#ffffff")),
    ]);
  }

  private static addSubtitle(
    engine: Engine,
    subtitle: string,
    size: number,
    centerX: number
  ): void {
    engine.add([
      engine.pos(centerX, 90),
      engine.anchor("center"),
      engine.text(subtitle, { size, font: "glyphmesss", align: "center" }),
      engine.color(engine.Color.fromHex("#c7c9ff")),
      engine.opacity(0.85),
    ]);
  }

  private static createButtons(
    engine: Engine,
    items: MenuItem[],
    config: SetupParams["config"]
  ): FocusableButton[] {
    return items.map((item, i) => {
      const btn = createFocusableButton(engine, {
        label: item.label,
        width: config.buttonWidth,
        height: config.buttonHeight,
        onSelect: item.action,
      });
      const y = config.startY + i * (config.buttonHeight + config.buttonGap);
      btn.pos = engine.vec2(config.centerX, y);
      btn.anchor = "center";
      return btn;
    });
  }

  private static setupInput(engine: Engine, buttons: FocusableButton[]): void {
    let keyboardIndex = 0;
    let hoverIndex: number | null = null;

    function updateFocus() {
      buttons.forEach((btn, i) => {
        if (hoverIndex !== null) {
          if (i === hoverIndex) btn.focus();
          else btn.blur();
        } else {
          if (i === keyboardIndex) btn.focus();
          else btn.blur();
        }
      });
    }

    buttons.forEach((btn, i) => {
      btn.on("hoverenter", () => {
        hoverIndex = i;
        updateFocus();
      });
      btn.on("hoverleave", () => {
        hoverIndex = null;
        updateFocus();
      });
    });

    updateFocus();

    const keyHandler = engine.onKeyPress((key) => {
      if (hoverIndex !== null) return;

      if (key === "up") {
        keyboardIndex = (keyboardIndex - 1 + buttons.length) % buttons.length;
        updateFocus();
        return;
      }
      if (key === "down") {
        keyboardIndex = (keyboardIndex + 1) % buttons.length;
        updateFocus();
        return;
      }
      if (key === "enter") {
        buttons[keyboardIndex].select();
        return;
      }
    });

    engine.onSceneLeave(() => {
      keyHandler.cancel();
    });
  }
}
