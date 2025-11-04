import type { Engine } from "../../../types/engine";
import { setBackgroundColor } from "../../../utils/set-background-color";
import { createFocusableButton } from "../../../utils/create-focusable-button";

interface MenuItem {
  label: string;
  action: () => void;
}

const CONFIG = {
  bgColor: "#20214a",
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

export function HomeMenu(engine: Engine) {
  setBackgroundColor(engine, CONFIG.bgColor);
  engine.camScale(1);
  engine.camPos(320, 180);

  engine.add([
    engine.pos(CONFIG.centerX, 60),
    engine.anchor("center"),
    engine.text(CONFIG.title, {
      size: CONFIG.titleSize,
      font: "glyphmesss",
      align: "center",
    }),
    engine.color(engine.Color.fromHex("#ffffff")),
  ]);

  engine.add([
    engine.pos(CONFIG.centerX, 90),
    engine.anchor("center"),
    engine.text(CONFIG.subtitle, {
      size: CONFIG.subtitleSize,
      font: "glyphmesss",
      align: "center",
    }),
    engine.color(engine.Color.fromHex("#c7c9ff")),
    engine.opacity(0.85),
  ]);

  const items: MenuItem[] = [
    {
      label: "Start Game",
      action: () => engine.go("room001", { exitName: null }),
    },
    { label: "Controls", action: () => engine.go("menu-controls") },
    { label: "Quit", action: () => {} },
  ];

  const buttons = items.map((item, i) => {
    const btn = createFocusableButton(engine, {
      label: item.label,
      width: CONFIG.buttonWidth,
      height: CONFIG.buttonHeight,
      onSelect: item.action,
    });
    const y = CONFIG.startY + i * (CONFIG.buttonHeight + CONFIG.buttonGap);
    btn.pos = engine.vec2(CONFIG.centerX, y);
    btn.anchor = "center";
    return btn;
  });

  let index = 0;

  function applyFocus() {
    buttons.forEach((b, i) => {
      // @ts-expect-error
      if (i === index) b.focus();
      // @ts-expect-error
      else b.blur();
    });
  }

  applyFocus();

  const keyHandler = engine.onKeyPress((key) => {
    if (key === "up") {
      index = (index - 1 + buttons.length) % buttons.length;
      applyFocus();
      return;
    }
    if (key === "down") {
      index = (index + 1) % buttons.length;
      applyFocus();
      return;
    }
    if (key === "enter") {
      // @ts-expect-error
      buttons[index].select();
      return;
    }
  });

  engine.onSceneLeave(() => {
    keyHandler.cancel();
  });
}
