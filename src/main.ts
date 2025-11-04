import { engine } from "./core/engine";

import { HomeMenuScene } from "./scenes/menus/home";
import { ControlsMenuScene } from "./scenes/menus/controls";
import { Room001Scene } from "./scenes/rooms/room-001";
import { Room002Scene } from "./scenes/rooms/room-002";

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
    new HomeMenuScene({ engine });
  });

  engine.scene("menu-controls", () => {
    new ControlsMenuScene({ engine });
  });

  engine.scene("room001", (previousSceneData) => {
    new Room001Scene({ engine, tiledMap: room001TiledMap, previousSceneData });
  });

  engine.scene("room002", (previousSceneData) => {
    new Room002Scene({ engine, tiledMap: room002TiledMap, previousSceneData });
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
