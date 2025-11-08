import type { Engine } from "../../../types/engine.type";
import type { Map } from "../../../types/map.interface";
import type { TiledMap, TiledObject } from "../../../types/tiled-map.interface";
import { MapLayer, MapLayerHelper } from "../../../utils/map-layer-helper";
import { MAP_TAGS } from "../../../types/tags.enum";

type Params = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
};

const isPolygon = (obj: TiledObject): boolean =>
  Boolean(obj?.polygon && obj.polygon.length > 0);

const isBossBarrier = (obj: TiledObject): boolean =>
  obj?.name === MAP_TAGS.BOSS_BARRIER;

const polygonCoordinates = (engine: Engine, obj: TiledObject) =>
  obj.polygon?.map((p) => engine.vec2(p.x, p.y));

const createPolygonArea = (
  engine: Engine,
  coordinates: ReturnType<Engine["vec2"]>[]
) =>
  engine.area({
    shape: new engine.Polygon(coordinates),
    collisionIgnore: [MAP_TAGS.COLLIDER],
  });

const createRectArea = (engine: Engine, obj: TiledObject) =>
  engine.area({
    shape: new engine.Rect(engine.vec2(0), obj.width, obj.height),
    collisionIgnore: [MAP_TAGS.COLLIDER],
  });

const createStaticBody = (engine: Engine) => engine.body({ isStatic: true });

const addCollider = (
  map: Map,
  position: ReturnType<Engine["pos"]>,
  area: ReturnType<Engine["area"]>,
  body: ReturnType<Engine["body"]>,
  type?: string
): void => {
  map.add([position, area, body, MAP_TAGS.COLLIDER, type]);
};

export function CollisionSystem({ engine, map, tiledMap }: Params): void {
  const objects = MapLayerHelper.getObjects(tiledMap, MapLayer.COLLIDERS);

  for (const obj of objects) {
    if (isBossBarrier(obj)) continue;

    if (isPolygon(obj)) {
      const coords = polygonCoordinates(engine, obj);
      if (!coords || coords.length === 0) continue;
      const area = createPolygonArea(engine, coords);
      const body = createStaticBody(engine);
      addCollider(map, engine.pos(obj.x, obj.y), area, body, obj.type);
    } else {
      const area = createRectArea(engine, obj);
      const body = createStaticBody(engine);
      addCollider(map, engine.pos(obj.x, obj.y), area, body, obj.type);
    }
  }
}
