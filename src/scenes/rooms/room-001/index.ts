import { CameraManager } from "../../../core/manager/camera.manager";
import { CartridgeManager } from "../../../core/manager/cartridge.manager";
import { EnemyManager } from "../../../core/manager/enemy.manager";
import { ExitManager } from "../../../core/manager/exit.manager";
import { MapManager } from "../../../core/manager/map";
import { PlayerManager } from "../../../core/manager/player.manager";
import { UIManager } from "../../../core/manager/ui.manager";
import type { Engine, EngineGameObj } from "../../../types/engine.interface";
import type { Map } from "../../../types/map.interface";
import type { Player } from "../../../types/player.interface";
import type { TiledMap } from "../../../types/tiled-map.interface";
import { setBackgroundColor } from "../../../utils/set-background-color";

type Room001Params = {
  engine: Engine;
  tiledMap: TiledMap;
  previousSceneData: EngineGameObj;
};

const CONFIG = {
  BACKGROUND_COLOR: "#a2aed5",
  CAMERA_SCALE: 2,
  INITIAL_CAMERA_POS: { x: 170, y: 100 },
  GRAVITY: 1000,
  MAP_SPRITE_NAME: "room001",
  COLLIDERS_LAYER_INDEX: 4,
  PLAYER_START_NAMES: ["player", "entrance-1", "entrance-2"],
  ENTRANCE_EXIT_MAPPING: {
    "entrance-1": "exit-1",
    "entrance-2": "exit-2",
  },
  CAMERA_ZONES_LAYER_INDEX: 6,
  EXITS_LAYER_INDEX: 7,
  EXIT_ROOM_NAME: "room002",
};

export class Room001Scene {
  private engine: Engine;
  private tiledMap: TiledMap;
  private previousSceneData: EngineGameObj;
  private map!: Map;
  private player!: Player;
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
      collidersLayerIndex: this.config.COLLIDERS_LAYER_INDEX,
      gravity: this.config.GRAVITY,
      initialCameraPos: this.config.INITIAL_CAMERA_POS,
      mapSpriteName: this.config.MAP_SPRITE_NAME,
      setMap: (map: Map) => (this.map = map),
    });

    this.player = PlayerManager.setup({
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
      isBossDefeated: false,
    });

    CartridgeManager.setup({
      engine: this.engine,
      map: this.map,
      tiledMap: this.tiledMap,
    });

    CameraManager.setup({
      engine: this.engine,
      map: this.map,
      player: this.player,
      tiledMap: this.tiledMap,
      initialCameraPos: this.config.INITIAL_CAMERA_POS,
      cameraZonesLayerIndex: this.config.CAMERA_ZONES_LAYER_INDEX,
      previousSceneExitName: this.previousSceneData.exitName,
    });

    UIManager.setup({
      engine: this.engine,
    });

    ExitManager.setup({
      engine: this.engine,
      map: this.map,
      tiledMap: this.tiledMap,
      exitsLayerIndex: this.config.EXITS_LAYER_INDEX,
      exitRoomName: this.config.EXIT_ROOM_NAME,
    });
  }
}
