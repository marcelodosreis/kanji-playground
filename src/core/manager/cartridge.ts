import { createCartridge } from "../../entities/cartridge";
import type { Engine } from "../../types/engine";
import type { Map } from "../../types/map";
import type { TiledMap, TiledObject } from "../../types/tiled-map";

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
        map.add(createCartridge(engine, engine.vec2(pos.x, pos.y)));
      });
  }
}
