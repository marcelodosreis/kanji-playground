import { CartridgeEntity } from "../entities/cartridge.entity";
import type { Engine, EngineGameObj } from "../../types/engine.interface";
import type { Map } from "../../types/map.interface";
import type { TiledMap, TiledObject } from "../../types/tiled-map.interface";
import { CartridgeCollisionSystem } from "../system/cartridge-collision.system";

type SpawnParams = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
};

export class CartridgeManager {
  public static setup(params: SpawnParams): void {
    const { engine, map, tiledMap } = params;

    const positions = tiledMap.layers[5].objects as TiledObject[];

    positions
      .filter((pos) => pos.type === "cartridge")
      .forEach((pos) => {
        const cartridge = map.add(
          CartridgeEntity(engine, engine.vec2(pos.x, pos.y))
        );

        this.initSystems(engine, cartridge);
      });
  }

  private static initSystems(engine: Engine, cartridge: EngineGameObj) {
    CartridgeCollisionSystem({ engine, cartridge });
  }
}
