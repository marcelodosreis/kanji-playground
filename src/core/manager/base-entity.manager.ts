import type { Engine } from "../../types/engine.type";
import type { Map } from "../../types/map.interface";
import type { TiledMap } from "../../types/tiled-map.interface";

export type BaseManagerParams = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
};

export abstract class BaseEntityManager<T = void> {
  protected readonly engine: Engine;
  protected readonly map: Map;
  protected readonly tiledMap: TiledMap;

  protected constructor(params: BaseManagerParams) {
    this.engine = params.engine;
    this.map = params.map;
    this.tiledMap = params.tiledMap;
  }

  abstract setup(): T | void;
}
