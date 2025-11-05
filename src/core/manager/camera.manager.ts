import type { Engine } from "../../types/engine.interface";
import type { Map } from "../../types/map.interface";
import type { Player } from "../../types/player.interface";
import type { TiledMap, TiledObject } from "../../types/tiled-map.interface";
import { state } from "../state";

type CameraSetupParams = {
  engine: Engine;
  map: Map;
  player: Player;
  tiledMap: TiledMap;
  cameraZonesLayerIndex: number;
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
    player,
    initialCameraPos,
    previousSceneExitName,
  }: CameraSetupParams): void {
    if (!previousSceneExitName) {
      this.setCameraPosition(engine, initialCameraPos.x, initialCameraPos.y);
    } else {
      this.setCameraPosition(engine, player.pos.x, player.pos.y);
    }
  }

  private static setCameraPosition(engine: Engine, x: number, y: number): void {
    engine.camPos(x, y);
  }

  private static setupCameraFollow({
    engine,
    map,
    player,
    tiledMap,
  }: CameraSetupParams): void {
    engine.onUpdate(() => {
      if (state.current().isPlayerInBossFight) return;

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
    cameraZonesLayerIndex,
  }: CameraSetupParams): void {
    const cameras = tiledMap.layers[cameraZonesLayerIndex]
      .objects as TiledObject[];

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
        collisionIgnore: ["collider"],
      }),
      engine.pos(camera.x, camera.y),
    ]);
  }

  private static setupCameraZoneCollision(
    engine: Engine,
    cameraZone: any,
    camera: TiledObject
  ): void {
    cameraZone.onCollide("player", () => {
      this.handleCameraZoneCollision(engine, camera);
    });
  }

  private static handleCameraZoneCollision(
    engine: Engine,
    camera: TiledObject
  ) {
    const targetY = camera.properties[0].value;
    if (engine.camPos().y !== targetY) {
      engine.tween(
        engine.camPos().y,
        targetY,
        0.8,
        (val) => engine.camPos(engine.camPos().x, val),
        engine.easings.linear
      );
    }
  }
}
