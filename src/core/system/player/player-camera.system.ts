import type { Engine } from "../../../types/engine.type";
import type { Map } from "../../../types/map.interface";
import type { Player } from "../../../types/player.interface";
import { MAP_TAGS, TAGS } from "../../../types/tags.enum";
import type { TiledMap, TiledObject } from "../../../types/tiled-map.interface";
import { smoothTransition } from "../../../utils/smooth-transition";
import { GLOBAL_STATE_CONTROLLER } from "../../global-state-controller";
import { MapLayer, MapLayerHelper } from "../../../utils/map-layer-helper";

type Params = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
  initialCameraPos: { x: number; y: number };
  previousSceneExitName?: string | null;
};

export function PlayerCameraSystem(params: Params): void {
  params.engine.camScale(2);
  setInitialCameraPosition(params);
  setupCameraFollow(params);
  setupCameraZones(params);
}

function setInitialCameraPosition({
  engine,
  initialCameraPos,
  previousSceneExitName,
}: Params): void {
  if (!previousSceneExitName) {
    setCameraPosition(engine, initialCameraPos.x, initialCameraPos.y);
  } else {
    const [player] = engine.get(TAGS.PLAYER, { recursive: true }) as Player[];
    setCameraPosition(engine, player.pos.x, player.pos.y);
  }
}

function setCameraPosition(engine: Engine, x: number, y: number): void {
  engine.camPos(x, y);
}

function setupCameraFollow({ engine, map, tiledMap }: Params): void {
  engine.onUpdate(() => {
    const player = engine.get(TAGS.PLAYER, { recursive: true })[0] as Player;
    if (GLOBAL_STATE_CONTROLLER.current().isPlayerInBossFight) return;

    const targetX = calculateCameraX(map, player, tiledMap);
    setCameraPosition(engine, targetX, engine.camPos().y);
  });
}

function calculateCameraX(
  map: Map,
  player: Player,
  tiledMap: TiledMap
): number {
  const leftBound = map.pos.x + 160;
  const rightBound = map.pos.x + tiledMap.width * tiledMap.tilewidth - 160;
  const playerX = player.pos.x;

  if (playerX < leftBound) return leftBound;
  if (playerX > rightBound) return rightBound;
  return playerX;
}

function setupCameraZones({ engine, map, tiledMap }: Params): void {
  const cameras = MapLayerHelper.getObjects(tiledMap, MapLayer.CAMERA);

  cameras.forEach((camera) => {
    const cameraZone = createCameraZone(engine, map, camera);
    setupCameraZoneCollision(engine, cameraZone, camera);
  });
}

function createCameraZone(engine: Engine, map: Map, camera: TiledObject): any {
  return map.add([
    engine.area({
      shape: new engine.Rect(engine.vec2(0), camera.width, camera.height),
      collisionIgnore: [MAP_TAGS.COLLIDER],
    }),
    engine.pos(camera.x, camera.y),
  ]);
}

function setupCameraZoneCollision(
  engine: Engine,
  cameraZone: any,
  camera: TiledObject
): void {
  cameraZone.onCollide(TAGS.PLAYER, () => {
    handleCameraZoneCollision(engine, camera);
  });
}

function handleCameraZoneCollision(engine: Engine, camera: TiledObject): void {
  const targetY = Number(camera.properties[0].value);
  if (engine.camPos().y !== targetY) {
    smoothTransition({
      engine,
      startValue: engine.camPos().y,
      endValue: targetY,
      durationSeconds: 0.8,
      onUpdate: (val) => engine.camPos(engine.camPos().x, val),
      easingFunction: engine.easings.linear,
    });
  }
}
