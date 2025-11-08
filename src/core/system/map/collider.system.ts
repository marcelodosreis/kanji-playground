import type { Engine } from "../../../types/engine.interface";
import type { Map } from "../../../types/map.interface";
import type { TiledObject } from "../../../types/tiled-map.interface";
import type { Vec2 } from "kaplay";
import { MAP_TAGS } from "../../../types/tags.enum";

type ColliderSystemParams = {
  engine: Engine;
  map: Map;
  colliders: TiledObject[];
};

export function ColliderSystem(params: ColliderSystemParams): void {
  const { engine, map, colliders } = params;

  colliders.forEach((collider) => {
    if (isBossBarrier(collider)) return;

    if (isPolygonCollider(collider)) {
      addPolygonCollider(engine, map, collider);
    } else {
      addRectCollider(engine, map, collider);
    }
  });
}

function isPolygonCollider(collider: TiledObject): boolean {
  return Boolean(collider?.polygon);
}

function isBossBarrier(collider: TiledObject): boolean {
  return collider.name === MAP_TAGS.BOSS_BARRIER;
}

function addPolygonCollider(
  engine: Engine,
  map: Map,
  collider: TiledObject
): void {
  const coordinates = getPolygonCoordinates(engine, collider);
  if (!coordinates) return;

  const polygonArea = createPolygonArea(engine, coordinates);
  const body = createStaticBody(engine);

  addColliderToMap(
    map,
    engine.pos(collider.x, collider.y),
    polygonArea,
    body,
    collider.type
  );
}

function getPolygonCoordinates(
  engine: Engine,
  collider: TiledObject
): Vec2[] | undefined {
  return collider.polygon?.map((point) => engine.vec2(point.x, point.y));
}

function createPolygonArea(engine: Engine, coordinates: Vec2[]) {
  return engine.area({
    shape: new engine.Polygon(coordinates),
    collisionIgnore: [MAP_TAGS.COLLIDER],
  });
}

function createStaticBody(engine: Engine) {
  return engine.body({ isStatic: true });
}

function addRectCollider(
  engine: Engine,
  map: Map,
  collider: TiledObject
): void {
  const rectArea = createRectArea(engine, collider);
  const body = createStaticBody(engine);

  addColliderToMap(
    map,
    engine.pos(collider.x, collider.y),
    rectArea,
    body,
    collider.type
  );
}

function createRectArea(engine: Engine, collider: TiledObject) {
  return engine.area({
    shape: new engine.Rect(engine.vec2(0), collider.width, collider.height),
    collisionIgnore: [MAP_TAGS.COLLIDER],
  });
}

function addColliderToMap(
  map: Map,
  position: ReturnType<Engine["pos"]>,
  area: ReturnType<Engine["area"]>,
  body: ReturnType<Engine["body"]>,
  type?: string
): void {
  map.add([position, area, body, MAP_TAGS.COLLIDER, type]);
}
