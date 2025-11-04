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
    const { engine, map, tiledMap, isBossDefeated } = params;

    const positions = tiledMap.layers[5].objects as TiledObject[];

    positions
      .filter((pos) => pos.type === "drone")
      .forEach((pos) => {
        const drone = map.add<Enemy>(
          createDrone(engine, engine.vec2(pos.x, pos.y))
        );
        drone.setBehavior();
        drone.setEvents();
      });

    const bossPosition = positions.find((pos) => pos.name === "boss");
    if (bossPosition && !isBossDefeated) {
      const boss = map.add<Boss>(
        createBoss(engine, engine.vec2(bossPosition.x, bossPosition.y))
      );
      boss.setBehavior();
      boss.setEvents();
    }
  }
}
