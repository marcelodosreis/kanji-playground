import { engine } from "./core/engine";
import { room001 } from "./scenes/room-001";
import { room002 } from "./scenes/room-002";
import type { TiledMap } from "./types/tiled-map";
import { setBackgroundColor } from "./utils/set-background-color";
import { createNotificationBox } from "./utils/create-notification-box";
import { menu } from "./scenes/menu";
import { menuControls } from "./scenes/menu-controls";

async function main() {
  const room001TiledMap: TiledMap = await (
    await fetch("./assets/maps/room-001/config.json")
  ).json();

  const room002TiledMap: TiledMap = await (
    await fetch("./assets/maps/room-002/config.json")
  ).json();

  engine.scene("room001", (previousSceneData) => {
    room001(engine, room001TiledMap, previousSceneData);
    const esc = engine.onKeyPress("escape", () => {
      engine.go("menu");
    });
    engine.onSceneLeave(() => esc.cancel());
  });

  engine.scene("room002", (previousSceneData) => {
    room002(engine, room002TiledMap, previousSceneData);
    const esc = engine.onKeyPress("escape", () => {
      engine.go("menu");
    });
    engine.onSceneLeave(() => esc.cancel());
  });

  engine.scene("final-exit", () => {
    setBackgroundColor(engine, "#20214a");
    engine.add(
      createNotificationBox(
        engine,
        "You escaped the factory!\n The End. Thanks for playing!"
      )
    );
    const esc = engine.onKeyPress("escape", () => {
      engine.go("menu");
    });
    engine.onSceneLeave(() => esc.cancel());
  });

  engine.scene("menu", () => {
    menu(engine);
  });

  engine.scene("menu-controls", () => {
    menuControls(engine);
  });

  engine.go("menu");
}

main();
