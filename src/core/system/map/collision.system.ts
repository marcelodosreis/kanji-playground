import type { Engine } from "../../../types/engine.type";
import type { Map } from "../../../types/map.interface";
import type { TiledMap, TiledObject } from "../../../types/tiled-map.interface";
import { MapLayer, MapLayerHelper } from "../../../helpers/map-layer-helper";
import { MAP_TAGS } from "../../../types/tags.enum";

type Params = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
};

export function CollisionSystem({ engine, map, tiledMap }: Params): void {
  const colliders = MapLayerHelper.getObjects(tiledMap, MapLayer.COLLIDERS);

  for (const obj of colliders) {
    if (isBossBarrier(obj)) continue;

    const shape = isPolygon(obj)
      ? createPolygonShape(engine, obj)
      : createRectShape(engine, obj);

    if (!shape) continue;

    const body = engine.body({ isStatic: true });
    const position = engine.pos(obj.x, obj.y);

    map.add([position, shape, body, MAP_TAGS.COLLIDER, obj.type]);
  }
}

function isPolygon(obj: TiledObject): boolean {
  return Boolean(obj?.polygon && obj.polygon.length > 0);
}

function isBossBarrier(obj: TiledObject): boolean {
  return obj?.name === MAP_TAGS.BOSS_BARRIER;
}

function createPolygonShape(engine: Engine, obj: TiledObject) {
  const points = obj.polygon?.map((p) => engine.vec2(p.x, p.y));
  if (!points?.length) return null;

  return engine.area({
    shape: new engine.Polygon(points),
    collisionIgnore: [MAP_TAGS.COLLIDER],
  });
}

function createRectShape(engine: Engine, obj: TiledObject) {
  return engine.area({
    shape: new engine.Rect(engine.vec2(0), obj.width, obj.height),
    collisionIgnore: [MAP_TAGS.COLLIDER],
  });
}
