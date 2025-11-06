import { BossManager } from "../../../core/manager/boss.manager";
import { CameraManager } from "../../../core/manager/camera.manager";
import { CartridgeManager } from "../../../core/manager/cartridge.manager";
import { EnemyManager } from "../../../core/manager/enemy.manager";
import { ExitManager } from "../../../core/manager/exit.manager";
import { MapManager } from "../../../core/manager/map.manager";
import { PlayerManager } from "../../../core/manager/player.manager";
import { UIManager } from "../../../core/manager/ui.manager";
import { state } from "../../../core/state";
import { PauseSystem } from "../../../core/system/pause.system";
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
  INITIAL_CAMERA_POS: { x: 170, y: 100 },
  GRAVITY: 1000,
  MAP_SPRITE_NAME: LEVEL_SCENES.ROOM_001,
  COLLIDERS_LAYER_INDEX: 4,
  PLAYER_START_NAMES: ["player", "entrance-1", "entrance-2"],
  ENTRANCE_EXIT_MAPPING: {
    "entrance-1": "exit-1",
    "entrance-2": "exit-2",
  },
  CAMERA_ZONES_LAYER_INDEX: 6,
  EXITS_LAYER_INDEX: 7,
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

    PauseSystem.setup({ engine: this.engine });
    
    MapManager.setup({
      engine: this.engine,
      tiledMap: this.tiledMap,
      cameraScale: this.config.CAMERA_SCALE,
      collidersLayerIndex: this.config.COLLIDERS_LAYER_INDEX,
      gravity: this.config.GRAVITY,
      initialCameraPos: this.config.INITIAL_CAMERA_POS,
      mapSpriteName: this.config.MAP_SPRITE_NAME,
      setMap: (map: Map) => (this.map = map),
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

    EnemyManager.setup({
      engine: this.engine,
      map: this.map,
      tiledMap: this.tiledMap,
    });

    BossManager.setup({
      engine: this.engine,
      map: this.map,
      tiledMap: this.tiledMap,
      isBossDefeated: state.current().isBossDefeated,
    });

    CartridgeManager.setup({
      engine: this.engine,
      map: this.map,
      tiledMap: this.tiledMap,
    });

    CameraManager.setup({
      engine: this.engine,
      map: this.map,
      tiledMap: this.tiledMap,
      initialCameraPos: this.config.INITIAL_CAMERA_POS,
      cameraZonesLayerIndex: this.config.CAMERA_ZONES_LAYER_INDEX,
      previousSceneExitName: this.previousSceneData.exitName,
    });

    ExitManager.setup({
      engine: this.engine,
      map: this.map,
      tiledMap: this.tiledMap,
      exitsLayerIndex: this.config.EXITS_LAYER_INDEX,
      exitRoomName: this.config.EXIT_ROOM_NAME,
    });

    UIManager.setup({
      engine: this.engine,
    });
  }
}
