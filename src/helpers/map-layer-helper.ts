import type { TiledMap, TiledObject } from "../types/tiled-map.interface";

export enum MapLayer {
  BACKGROUND_2 = 0,
  BACKGROUND = 1,
  PLATFORMS = 2,
  PROPS = 3,
  COLLIDERS = 4,
  PIN = 5,
  CAMERA = 6,
  EXIT = 7,
}

export class MapLayerHelper {
  static getLayer(tiledMap: TiledMap, layer: MapLayer) {
    const mapLayer = tiledMap.layers[layer];
    if (!mapLayer) {
      throw new Error(
        `Layer ${MapLayer[layer]} (index ${layer}) not found in TiledMap`
      );
    }
    return mapLayer;
  }

  static getObjects(tiledMap: TiledMap, layer: MapLayer): TiledObject[] {
    const layerData = this.getLayer(tiledMap, layer);
    if (!layerData.objects) {
      return [];
    }
    return layerData.objects as TiledObject[];
  }
}
