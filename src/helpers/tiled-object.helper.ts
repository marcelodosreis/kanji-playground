import type { TiledMap, TiledObject } from "../types/tiled-map.interface";
import { MapLayer, MapLayerHelper } from "../utils/map-layer-helper";

export class TiledObjectHelper {
  static findByName(map: TiledMap, name: string): TiledObject | undefined {
    return MapLayerHelper.getObjects(map, MapLayer.PIN).find((obj) => obj.name === name);
  }

  static findByType(map: TiledMap, type: string): TiledObject[] {
    return MapLayerHelper.getObjects(map, MapLayer.PIN).filter((obj) => obj.type === type);
  }

  static filterByPredicate(map: TiledMap, predicate: (obj: TiledObject) => boolean): TiledObject[] {
    return MapLayerHelper.getObjects(map, MapLayer.PIN).filter(predicate);
  }
}