import type { Engine, EngineGameObj } from "../../types/engine";
import type { Player } from "../../types/player";
import type { TiledMap } from "../../types/tiled-map";
import type { Map } from "../../types/map";

import { CartridgeManager } from "../../core/manager/cartridge";
import { CameraManager } from "../../core/manager/camera";
import { ExitManager } from "../../core/manager/exit";
import { MapManager } from "../../core/manager/map";
import { PlayerManager } from "../../core/manager/player";
import { UIManager } from "../../core/manager/ui";
import { setBackgroundColor } from "../../utils/set-background-color";

type Room002Params = {
  engine: Engine;
  tiledMap: TiledMap;
  previousSceneData: EngineGameObj;
};

const CONFIG = {
  BACKGROUND_COLOR: "#a2aed5",
  CAMERA_SCALE: 2,
  INITIAL_CAMERA_POS: { x: 170, y: 100 },
  GRAVITY: 1000,
  MAP_SPRITE_NAME: "room002",
  COLLIDERS_LAYER_INDEX: 4,
  PLAYER_START_NAMES: ["entrance-1", "entrance-2"],
  ENTRANCE_EXIT_MAPPING: {
    "entrance-1": "exit-1",
    "entrance-2": "exit-2",
  },
  CAMERA_ZONES_LAYER_INDEX: 6,
  EXITS_LAYER_INDEX: 7,
  EXIT_ROOM_NAME: "room001",
  RESPAWN_BOUNDS: 1000,
  RESPAWN_ROOM_NAME: "room002",
};

export class Room002 {
  private engine: Engine;
  private tiledMap: TiledMap;
  private previousSceneData: EngineGameObj;
  private map!: Map;
  private player!: Player;

  constructor(params: Room002Params) {
    this.engine = params.engine;
    this.tiledMap = params.tiledMap;
    this.previousSceneData = params.previousSceneData;

    this.initialize();
  }

  public initialize(): void {
    setBackgroundColor(this.engine, CONFIG.BACKGROUND_COLOR);

    MapManager.setup({
      engine: this.engine,
      tiledMap: this.tiledMap,
      config: {
        backgroundColor: CONFIG.BACKGROUND_COLOR,
        cameraScale: CONFIG.CAMERA_SCALE,
        initialCameraPos: CONFIG.INITIAL_CAMERA_POS,
        gravity: CONFIG.GRAVITY,
        mapSpriteName: CONFIG.MAP_SPRITE_NAME,
        collidersLayerIndex: CONFIG.COLLIDERS_LAYER_INDEX,
      },
      setMap: (map: Map) => (this.map = map),
    });

    this.player = PlayerManager.setup({
      engine: this.engine,
      map: this.map,
      tiledMap: this.tiledMap,
      previousSceneData: this.previousSceneData,
      playerStartNames: CONFIG.PLAYER_START_NAMES,
      entranceExitMapping: CONFIG.ENTRANCE_EXIT_MAPPING,
      positionOffset: { x: this.map.pos.x, y: this.map.pos.y },
      respawnConfig: {
        bounds: CONFIG.RESPAWN_BOUNDS,
        roomName: CONFIG.RESPAWN_ROOM_NAME,
        exitName: "exit-2",
      },
    });

    CartridgeManager.spawnAll({
      engine: this.engine,
      map: this.map,
      tiledMap: this.tiledMap,
    });

    CameraManager.setup({
      engine: this.engine,
      map: this.map,
      player: this.player,
      tiledMap: this.tiledMap,
      initialCameraPos: CONFIG.INITIAL_CAMERA_POS,
      cameraZonesLayerIndex: CONFIG.CAMERA_ZONES_LAYER_INDEX,
    });

    ExitManager.setup({
      engine: this.engine,
      map: this.map,
      tiledMap: this.tiledMap,
      exitsLayerIndex: CONFIG.EXITS_LAYER_INDEX,
      exitRoomName: CONFIG.EXIT_ROOM_NAME,
    });

    UIManager.setupHealthBar({
      engine: this.engine,
    });
  }
}
