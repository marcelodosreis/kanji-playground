import type { Engine, EngineGameObj } from "../../types/engine.type";
import type { Map } from "../../types/map.interface";
import { MAP_TAGS, TAGS } from "../../types/tags.enum";
import type { TiledMap, TiledObject } from "../../types/tiled-map.interface";
import { smoothTransition } from "../../utils/smooth-transition";
import { GLOBAL_STATE_CONTROLLER } from "../../core/global-state-controller";
import { MapLayer, MapLayerHelper } from "../../helpers/map-layer-helper";
import type { SCENE_DATA } from "../../types/scenes.enum";
import type { Player } from "../../types/player.interface";

type Params = {
  engine: Engine;
  map: Map;
  player: Player,
  tiledMap: TiledMap;
  initialCameraPos: { x: number; y: number };
  previousSceneData?: SCENE_DATA;
};

type CameraZone = EngineGameObj & {
  onCollide: (tag: string, callback: () => void) => void;
};

type CameraBounds = {
  left: number;
  right: number;
};

const CAMERA_CONFIG = {
  SCALE: 2,
  HORIZONTAL_OFFSET: 160,
  TRANSITION_DURATION: 0.8,
} as const;

const setCameraPosition = (engine: Engine, x: number, y: number): void => {
  engine.camPos(x, y);
};

const calculateBounds = (map: Map, tiledMap: TiledMap): CameraBounds => ({
  left: map.pos.x + CAMERA_CONFIG.HORIZONTAL_OFFSET,
  right:
    map.pos.x +
    tiledMap.width * tiledMap.tilewidth -
    CAMERA_CONFIG.HORIZONTAL_OFFSET,
});

const clampCameraX = (playerX: number, bounds: CameraBounds): number => {
  if (playerX < bounds.left) return bounds.left;
  if (playerX > bounds.right) return bounds.right;
  return playerX;
};

const shouldUsePlayerPosition = (
  previousSceneExitName?: string | null
): boolean => !!previousSceneExitName;

const isInBossFight = (): boolean =>
  GLOBAL_STATE_CONTROLLER.current().isPlayerInBossFight;

const getCameraTargetY = (camera: TiledObject): number =>
  Number(camera.properties[0].value);

const shouldTransitionCamera = (currentY: number, targetY: number): boolean =>
  currentY !== targetY;

const createCameraZone = (
  engine: Engine,
  map: Map,
  camera: TiledObject
): CameraZone => {
  return map.add([
    engine.area({
      shape: new engine.Rect(engine.vec2(0), camera.width, camera.height),
      collisionIgnore: [MAP_TAGS.COLLIDER],
    }),
    engine.pos(camera.x, camera.y),
  ]) as CameraZone;
};

const applyCameraTransition = (engine: Engine, targetY: number): void => {
  smoothTransition({
    engine,
    startValue: engine.camPos().y,
    endValue: targetY,
    durationSeconds: CAMERA_CONFIG.TRANSITION_DURATION,
    onUpdate: (val) => setCameraPosition(engine, engine.camPos().x, val),
    easingFunction: engine.easings.linear,
  });
};

export function PlayerCameraSystem({
  engine,
  player,
  map,
  tiledMap,
  initialCameraPos,
  previousSceneData,
}: Params): void {
  engine.camScale(CAMERA_CONFIG.SCALE);

  const bounds = calculateBounds(map, tiledMap);

  const setInitialPosition = (): void => {
    if (shouldUsePlayerPosition(previousSceneData?.exitName)) {
      setCameraPosition(engine, player.pos.x, player.pos.y);
    } else {
      setCameraPosition(engine, initialCameraPos.x, initialCameraPos.y);
    }
  };

  const handleCameraFollow = (): void => {
    if (isInBossFight()) return;

    const targetX = clampCameraX(player.pos.x, bounds);
    setCameraPosition(engine, targetX, engine.camPos().y);
  };

  const handleZoneCollision = (targetY: number): void => {
    const currentY = engine.camPos().y;

    if (shouldTransitionCamera(currentY, targetY)) {
      applyCameraTransition(engine, targetY);
    }
  };

  const setupCameraZones = (): void => {
    const cameras = MapLayerHelper.getObjects(tiledMap, MapLayer.CAMERA);

    cameras.forEach((camera) => {
      const cameraZone = createCameraZone(engine, map, camera);
      const targetY = getCameraTargetY(camera);

      cameraZone.onCollide(TAGS.PLAYER, () => {
        handleZoneCollision(targetY);
      });
    });
  };

  setInitialPosition();
  setupCameraZones();
  engine.onUpdate(handleCameraFollow);
}
