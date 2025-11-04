import { engine } from "./core/engine";

import { menu } from "./scenes/menu";
import { menuControls } from "./scenes/menu-controls";
import { Room001 } from "./scenes/room-001";
import { Room002 } from "./scenes/room-002";

import { createNotificationBox } from "./utils/create-notification-box";
import { loadTiledMap } from "./utils/load-tiles-map";
import { setBackgroundColor } from "./utils/set-background-color";

async function registerScenes() {
  const room001TiledMap = await loadTiledMap(
    "./assets/maps/room-001/config.json"
  );
  const room002TiledMap = await loadTiledMap(
    "./assets/maps/room-002/config.json"
  );

  engine.scene("menu", () => {
    menu(engine);
  });

  engine.scene("menu-controls", () => {
    menuControls(engine);
  });

  engine.scene("room001", (previousSceneData) => {
    new Room001({ engine, tiledMap: room001TiledMap, previousSceneData });
  });

  engine.scene("room002", (previousSceneData) => {
    new Room002({ engine, tiledMap: room002TiledMap, previousSceneData });
  });

  engine.scene("final-exit", () => {
    setBackgroundColor(engine, "#20214a");
    engine.add(
      createNotificationBox(
        engine,
        "You escaped the factory!\n The End. Thanks for playing!"
      )
    );
  });
}

async function main() {
  await registerScenes();
  engine.go("menu");
}

main();
