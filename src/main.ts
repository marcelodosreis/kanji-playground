import { engine } from "./core/engine";
import { loadMapSprites } from "./core/loaders/sprites/map";
import { audios } from "./core/loaders/audio";

import { HomeMenuScene } from "./scenes/menus/home";
import { ControlsMenuScene } from "./scenes/menus/controls";
import { Room001Scene } from "./scenes/rooms/room-001";
import { Room002Scene } from "./scenes/rooms/room-002";
import { FinalExitScene } from "./scenes/menus/final";

import { loadTiledMap } from "./utils/load-tiles-map";
import { LEVEL_SCENES, MENU_SCENES } from "./types/scenes.enum";
import { loadEnemiesSprites } from "./core/loaders/sprites/enemies";
import { loadPlayerSprites } from "./core/loaders/sprites/player";
import { loadUiAssets } from "./core/loaders/sprites/ui";

async function registerScenes() {
  const room001TiledMap = await loadTiledMap(
    "./assets/maps/room-001/config.json"
  );
  const room002TiledMap = await loadTiledMap(
    "./assets/maps/room-002/config.json"
  );

  engine.scene(MENU_SCENES.HOME, () => {
    new HomeMenuScene({ engine });
  });

  engine.scene(MENU_SCENES.CONTROLS, () => {
    new ControlsMenuScene({ engine });
  });

  engine.scene(LEVEL_SCENES.ROOM_001, (previousSceneData) => {
    new Room001Scene({ engine, tiledMap: room001TiledMap, previousSceneData });
  });

  engine.scene(LEVEL_SCENES.ROOM_002, (previousSceneData) => {
    new Room002Scene({ engine, tiledMap: room002TiledMap, previousSceneData });
  });

  engine.scene(MENU_SCENES.FINAL, () => {
    new FinalExitScene({ engine });
  });
}

async function main(): Promise<void> {
  await registerScenes();
  await loadPlayerSprites();
  await loadMapSprites();
  await loadEnemiesSprites();
  await loadUiAssets();
  await audios();
  engine.go("menu");
}
main();
