import type { Engine } from "../../types/engine.interface";
import type { Map } from "../../types/map.interface";
import type { Player } from "../../types/player.interface";
import { MAP_TAGS, TAGS } from "../../types/tags.enum";
import type { TiledMap, TiledObject } from "../../types/tiled-map.interface";
import { smoothTransition } from "../../utils/smooth-transition";
import { GLOBAL_STATE_CONTROLLER } from "../global-state-controller";
import { MapLayer, MapLayerHelper } from "../../utils/map-layer.helper";

type CameraSetupParams = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
  initialCameraPos: { x: number; y: number };
  previousSceneExitName?: string | null;
};

export class CameraManager {
  public static setup(params: CameraSetupParams): void {
    this.setInitialCameraPosition(params);
    this.setupCameraFollow(params);
    this.setupCameraZones(params);
  }

  private static setInitialCameraPosition({
    engine,
    initialCameraPos,
    previousSceneExitName,
  }: CameraSetupParams): void {
    if (!previousSceneExitName) {
      this.setCameraPosition(engine, initialCameraPos.x, initialCameraPos.y);
    } else {
      const [player] = engine.get(TAGS.PLAYER, { recursive: true }) as Player[];
      this.setCameraPosition(engine, player.pos.x, player.pos.y);
    }
  }

  private static setCameraPosition(engine: Engine, x: number, y: number): void {
    engine.camPos(x, y);
  }

  private static setupCameraFollow({
    engine,
    map,
    tiledMap,
  }: CameraSetupParams): void {
    engine.onUpdate(() => {
      const player = engine.get(TAGS.PLAYER, { recursive: true })[0] as Player;
      if (GLOBAL_STATE_CONTROLLER.current().isPlayerInBossFight) return;

      const targetX = this.calculateCameraX(map, player, tiledMap);
      this.setCameraPosition(engine, targetX, engine.camPos().y);
    });
  }

  private static calculateCameraX(
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

  private static setupCameraZones({
    engine,
    map,
    tiledMap,
  }: CameraSetupParams): void {
    const cameras = MapLayerHelper.getObjects(tiledMap, MapLayer.CAMERA);

    cameras.forEach((camera) => {
      const cameraZone = this.createCameraZone(engine, map, camera);
      this.setupCameraZoneCollision(engine, cameraZone, camera);
    });
  }

  private static createCameraZone(
    engine: Engine,
    map: Map,
    camera: TiledObject
  ) {
    return map.add([
      engine.area({
        shape: new engine.Rect(engine.vec2(0), camera.width, camera.height),
        collisionIgnore: [MAP_TAGS.COLLIDER],
      }),
      engine.pos(camera.x, camera.y),
    ]);
  }

  private static setupCameraZoneCollision(
    engine: Engine,
    cameraZone: any,
    camera: TiledObject
  ): void {
    cameraZone.onCollide(TAGS.PLAYER, () => {
      this.handleCameraZoneCollision(engine, camera);
    });
  }

  private static handleCameraZoneCollision(
    engine: Engine,
    camera: TiledObject
  ) {
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
}
