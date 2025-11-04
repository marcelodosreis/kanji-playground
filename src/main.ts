import { engine } from "./core/engine";

import { HomeMenuScene } from "./scenes/menus/home";
import { ControlsMenuScene } from "./scenes/menus/controls";
import { Room001Scene } from "./scenes/rooms/room-001";
import { Room002Scene } from "./scenes/rooms/room-002";
import { FinalExitScene } from "./scenes/menus/final";

import { loadTiledMap } from "./utils/load-tiles-map";
import { loadAssets } from "./core/loadAssets";

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
    new FinalExitScene({ engine });
  });
}

async function main() {
  await registerScenes();
  await loadAssets();
  engine.go("menu");
}

main();
