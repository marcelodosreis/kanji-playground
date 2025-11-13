import type { CollidersEngineGameObj, Engine } from "../../types/engine.type";
import type { Map } from "../../types/map.interface";
import type { TiledMap, TiledObject } from "../../types/tiled-map.interface";
import { MapLayer, MapLayerHelper } from "../../helpers/map-layer-helper";
import { MAP_TAGS } from "../../types/tags.enum";

type Params = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
};

export function CollisionSystem({ engine, map, tiledMap }: Params) {
  const collidersObject = MapLayerHelper.getObjects(
    tiledMap,
    MapLayer.COLLIDERS
  );
  const colliders: CollidersEngineGameObj[] = [];

  for (const obj of collidersObject) {
    if (obj?.name === MAP_TAGS.BOSS_BARRIER) continue;

    const shape =
      obj?.polygon && obj.polygon.length > 0
        ? createPolygonShape(engine, obj)
        : createRectShape(engine, obj);

    if (!shape) continue;

    const body = engine.body({ isStatic: true });
    const position = engine.pos(obj.x, obj.y);
    const ent = map.add([position, shape, body, MAP_TAGS.COLLIDER, obj.type]);
    colliders.push(ent);
  }
  return colliders;
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
