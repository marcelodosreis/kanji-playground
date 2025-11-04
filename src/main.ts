import { engine } from "./core/engine";
import { room001 } from "./scenes/room-001";
import { room002 } from "./scenes/room-002";
import { setBackgroundColor } from "./utils/set-background-color";
import { createNotificationBox } from "./utils/create-notification-box";
import { menu } from "./scenes/menu";
import { menuControls } from "./scenes/menu-controls";
import { loadTiledMap } from "./utils/load-tiles-map";

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
    room001(engine, room001TiledMap, previousSceneData);
  });

  engine.scene("room002", (previousSceneData) => {
    room002(engine, room002TiledMap, previousSceneData);
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
