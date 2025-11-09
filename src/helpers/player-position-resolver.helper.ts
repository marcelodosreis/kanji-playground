import type { SCENE_DATA } from "../types/scenes.enum";
import { TAGS } from "../types/tags.enum";
import type { TiledMap, TiledObject } from "../types/tiled-map.interface";
import { MapLayer, MapLayerHelper } from "./map-layer-helper";

export class PlayerPositionResolver {
  static resolveStart(
    tiledMap: TiledMap,
    previousSceneData: SCENE_DATA,
    playerStartNames: string[],
    entranceExitMapping: Record<string, string>
  ): TiledObject | undefined {
    const pinObjects = this.getAllPinObjects(tiledMap);
    return this.findMatchingStart(
      pinObjects,
      previousSceneData,
      playerStartNames,
      entranceExitMapping
    );
  }

  private static getAllPinObjects(tiledMap: TiledMap): TiledObject[] {
    return MapLayerHelper.getObjects(tiledMap, MapLayer.PIN);
  }

  private static findMatchingStart(
    pinObjects: TiledObject[],
    previousSceneData: SCENE_DATA,
    playerStartNames: string[],
    entranceExitMapping: Record<string, string>
  ): TiledObject | undefined {
    return pinObjects.find(
      (object) =>
        this.isDefaultStart(object, previousSceneData, playerStartNames) ||
        this.isEntranceExitMatch(
          object,
          previousSceneData,
          playerStartNames,
          entranceExitMapping
        )
    );
  }

  private static isDefaultStart(
    object: TiledObject,
    previousSceneData: SCENE_DATA,
    playerStartNames: string[]
  ): boolean {
    const isTaggedAsPlayer = object.name === TAGS.PLAYER;
    const hasNoPreviousExit = !previousSceneData.exitName;
    const isAllowedStartName = playerStartNames.includes(TAGS.PLAYER);
    return isTaggedAsPlayer && hasNoPreviousExit && isAllowedStartName;
  }

  private static isEntranceExitMatch(
    object: TiledObject,
    previousSceneData: SCENE_DATA,
    playerStartNames: string[],
    entranceExitMapping: Record<string, string>
  ): boolean {
    const isAllowedStartPoint = playerStartNames.includes(object.name);
    const expectedExit = entranceExitMapping[object.name];
    const cameFromExpectedExit = previousSceneData.exitName === expectedExit;
    return isAllowedStartPoint && cameFromExpectedExit;
  }
}
