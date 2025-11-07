import type { Engine, EngineGameObj } from "../../../types/engine.interface";
import type { TiledMap } from "../../../types/tiled-map.interface";
import type { Map } from "../../../types/map.interface";

import { HealthPickupManager } from "../../../core/manager/health-pickup.manager";
import { CameraManager } from "../../../core/manager/camera.manager";
import { ExitManager } from "../../../core/manager/exit.manager";
import { MapManager } from "../../../core/manager/map.manager";
import { PlayerManager } from "../../../core/manager/player.manager";
import { UIManager } from "../../../core/manager/ui.manager";
import { setBackgroundColor } from "../../../utils/set-background-color";
import { LEVEL_SCENES } from "../../../types/scenes.enum";
import { COLORS } from "../../../types/colors.enum";

type Room002Params = {
  engine: Engine;
  tiledMap: TiledMap;
  previousSceneData: EngineGameObj;
};

const CONFIG = {
  BACKGROUND_COLOR: COLORS.BACKGROUND_SECONDARY,
  CAMERA_SCALE: 2,
  INITIAL_CAMERA_POS: { x: 170, y: 100 },
  GRAVITY: 1000,
  MAP_SPRITE_NAME: LEVEL_SCENES.ROOM_002,
  COLLIDERS_LAYER_INDEX: 4,
  PLAYER_START_NAMES: ["entrance-1", "entrance-2"],
  ENTRANCE_EXIT_MAPPING: {
    "entrance-1": "exit-1",
    "entrance-2": "exit-2",
  },
  CAMERA_ZONES_LAYER_INDEX: 6,
  EXITS_LAYER_INDEX: 7,
  EXIT_ROOM_NAME: LEVEL_SCENES.ROOM_001,
  RESPAWN_BOUNDS: 1000,
  RESPAWN_ROOM_NAME: LEVEL_SCENES.ROOM_002,
};

export class Room002Scene {
  private engine: Engine;
  private tiledMap: TiledMap;
  private previousSceneData: EngineGameObj;
  private map!: Map;
  private config = CONFIG;

  constructor(params: Room002Params) {
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
      positionOffset: { x: this.map.pos.x, y: this.map.pos.y },
      respawnConfig: {
        bounds: this.config.RESPAWN_BOUNDS,
        roomName: this.config.RESPAWN_ROOM_NAME,
        exitName: this.previousSceneData.exitName,
      },
    });

    HealthPickupManager.setup({
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
