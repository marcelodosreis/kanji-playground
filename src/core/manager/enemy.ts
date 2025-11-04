import { createDrone } from "../../entities/drone";
import { createBoss } from "../../entities/boss";
import type { Engine } from "../../types/engine";
import type { Map } from "../../types/map";
import type { TiledMap, TiledObject } from "../../types/tiled-map";
import type { Enemy } from "../../types/enemy";
import type { Boss } from "../../types/boss";

type SpawnAllParams = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
  isBossDefeated: boolean;
};

export class EnemyManager {
  static spawnAll(params: SpawnAllParams): void {
    const { tiledMap } = params;
    const positions = this.getSpawnPositions(tiledMap);

    this.spawnDrones(params, positions);
    this.spawnBoss(params, positions);
  }

  private static getSpawnPositions(tiledMap: TiledMap): TiledObject[] {
    return tiledMap.layers[5].objects as TiledObject[];
  }

  private static spawnDrones(
    params: SpawnAllParams,
    positions: TiledObject[]
  ): void {
    const { engine, map } = params;
    positions
      .filter((pos) => pos.type === "drone")
      .forEach((pos) => this.spawnDrone(engine, map, pos));
  }

  private static spawnDrone(engine: Engine, map: Map, pos: TiledObject): void {
    const drone = map.add<Enemy>(
      createDrone(engine, engine.vec2(pos.x, pos.y))
    );
    drone.setBehavior();
    drone.setEvents();
  }

  private static spawnBoss(
    params: SpawnAllParams,
    positions: TiledObject[]
  ): void {
    const { engine, map, isBossDefeated } = params;
    if (isBossDefeated) return;

    const bossPosition = positions.find((pos) => pos.name === "boss");
    if (!bossPosition) return;

    const boss = map.add<Boss>(
      createBoss(engine, engine.vec2(bossPosition.x, bossPosition.y))
    );
    boss.setBehavior();
    boss.setEvents();
  }
}
