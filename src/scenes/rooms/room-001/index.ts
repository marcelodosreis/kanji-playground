import { BossManager } from "../../../core/manager/boss.manager";
import { CameraManager } from "../../../core/manager/camera.manager";
import { FlyingEnemyManager } from "../../../core/manager/flying-enemy.manager";
import { MapManager } from "../../../core/manager/map.manager";
import { PlayerManager } from "../../../core/manager/player.manager";
import { UIManager } from "../../../core/manager/ui.manager";
import { GLOBAL_STATE_CONTROLLER } from "../../../core/global-state-controller";
import { COLORS } from "../../../types/colors.enum";
import type { Engine, EngineGameObj } from "../../../types/engine.interface";
import type { Map } from "../../../types/map.interface";
import { LEVEL_SCENES } from "../../../types/scenes.enum";
import type { TiledMap } from "../../../types/tiled-map.interface";
import { setBackgroundColor } from "../../../utils/set-background-color";

type Room001Params = {
  engine: Engine;
  tiledMap: TiledMap;
  previousSceneData: EngineGameObj;
};

const CONFIG = {
  BACKGROUND_COLOR: COLORS.BACKGROUND_SECONDARY,
  CAMERA_SCALE: 2,
  INITIAL_CAMERA_POS: { x: 170, y: 270 },
  GRAVITY: 1000,
  MAP_SPRITE_NAME: LEVEL_SCENES.ROOM_001,
  PLAYER_START_NAMES: ["player", "entrance-1", "entrance-2"],
  ENTRANCE_EXIT_MAPPING: {
    "entrance-1": "exit-1",
    "entrance-2": "exit-2",
  },
  EXIT_ROOM_NAME: LEVEL_SCENES.ROOM_002,
};

export class Room001Scene {
  private engine: Engine;
  private tiledMap: TiledMap;
  private previousSceneData: EngineGameObj;
  private map!: Map;
  private config = CONFIG;

  constructor(params: Room001Params) {
    this.engine = params.engine;
    this.tiledMap = params.tiledMap;
    this.previousSceneData = params.previousSceneData;

    this.initialize();
  }

  public initialize(): void {
    setBackgroundColor(this.engine, this.config.BACKGROUND_COLOR);

    MapManager.setup({
      engine: this.engine,
      tiledMap: this.tiledMap,
      cameraScale: this.config.CAMERA_SCALE,
      gravity: this.config.GRAVITY,
      initialCameraPos: this.config.INITIAL_CAMERA_POS,
      mapSpriteName: this.config.MAP_SPRITE_NAME,
      setMap: (map: Map) => (this.map = map),
      exitRoomName: this.config.EXIT_ROOM_NAME,
    });

    PlayerManager.setup({
      engine: this.engine,
      map: this.map,
      tiledMap: this.tiledMap,
      previousSceneData: this.previousSceneData,
      playerStartNames: this.config.PLAYER_START_NAMES,
      entranceExitMapping: this.config.ENTRANCE_EXIT_MAPPING,
      respawnConfig: {
        bounds: 1000,
        roomName: this.config.MAP_SPRITE_NAME,
      },
    });

    FlyingEnemyManager.setup({
      engine: this.engine,
      map: this.map,
      tiledMap: this.tiledMap,
    });

    BossManager.setup({
      engine: this.engine,
      map: this.map,
      tiledMap: this.tiledMap,
      isBossDefeated: GLOBAL_STATE_CONTROLLER.current().isBossDefeated,
    });

    CameraManager.setup({
      engine: this.engine,
      map: this.map,
      tiledMap: this.tiledMap,
      initialCameraPos: this.config.INITIAL_CAMERA_POS,
      previousSceneExitName: this.previousSceneData.exitName,
    });

    UIManager.setup({
      engine: this.engine,
    });
  }
}
