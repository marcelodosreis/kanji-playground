import { BossManager } from "../../../core/manager/boss.manager";
import { FlyingEnemyManager } from "../../../core/manager/flying-enemy.manager";
import { MapManager } from "../../../core/manager/map.manager";
import { PlayerManager } from "../../../core/manager/player.manager";
import { UIManager } from "../../../core/manager/ui.manager";
import { GLOBAL_STATE_CONTROLLER } from "../../../core/global-state-controller";
import { COLORS } from "../../../types/colors.enum";
import type { Engine, EngineGameObj } from "../../../types/engine.type";
import { LEVEL_SCENES } from "../../../types/scenes.enum";
import type { TiledMap } from "../../../types/tiled-map.interface";
import { setBackgroundColor } from "../../../utils/set-background-color";
import { HealthPickupManager } from "../../../core/manager/health-pickup.manager";
import { PauseManager } from "../../../core/manager/pause.manager";

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
  private config = CONFIG;

  constructor(params: Room001Params) {
    this.engine = params.engine;
    this.tiledMap = params.tiledMap;
    this.previousSceneData = params.previousSceneData;

    this.initialize();
  }

  public initialize(): void {
    setBackgroundColor(this.engine, this.config.BACKGROUND_COLOR);

    const map = MapManager.setup({
      engine: this.engine,
      tiledMap: this.tiledMap,
      gravity: this.config.GRAVITY,
      mapSpriteName: this.config.MAP_SPRITE_NAME,
      exitRoomName: this.config.EXIT_ROOM_NAME,
    });

    PlayerManager.setup({
      map: map,
      engine: this.engine,
      tiledMap: this.tiledMap,
      previousSceneData: this.previousSceneData,
      playerStartNames: this.config.PLAYER_START_NAMES,
      entranceExitMapping: this.config.ENTRANCE_EXIT_MAPPING,
      respawnConfig: {
        bounds: 1000,
        roomName: this.config.MAP_SPRITE_NAME,
      },
      initialCameraPos: this.config.INITIAL_CAMERA_POS,
    });

    FlyingEnemyManager.setup({
      map: map,
      engine: this.engine,
      tiledMap: this.tiledMap,
    });

    HealthPickupManager.setup({
      map,
      engine: this.engine,
      tiledMap: this.tiledMap,
    });

    PauseManager.setup({ engine: this.engine });

    BossManager.setup({
      map: map,
      engine: this.engine,
      tiledMap: this.tiledMap,
      isBossDefeated: GLOBAL_STATE_CONTROLLER.current().isBossDefeated,
    });

    UIManager.setup({
      engine: this.engine,
    });
  }
}
