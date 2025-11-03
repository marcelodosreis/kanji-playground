import type { Engine } from "../types/engine";
import type { Map } from "../types/map";
import type { TiledObject } from "../types/tiledMap";

export function setMapCollider(
  engine: Engine,
  map: Map,
  colliders: TiledObject[]
) {
  for (const collider of colliders) {
    if (collider?.polygon) {
      const coordinates = [];
      for (const point of collider?.polygon) {
        coordinates.push(engine.vec2(point.x, point.y));
      }

      map.add([
        engine.pos(collider.x, collider.y),
        engine.area({
          shape: new engine.Polygon(coordinates),
          collisionIgnore: ["collider"],
        }),
        engine.body({ isStatic: true }),
        "collider",
        collider.type,
      ]);
      continue;
    }

    if (collider.name === "boss-barrier") {
      // ToDO
      continue;
    }

    map.add([
      engine.pos(collider.x, collider.y),
      engine.area({
        shape: new engine.Rect(engine.vec2(0), collider.width, collider.height),
        collisionIgnore: ["collider"],
      }),
      engine.body({
        isStatic: true,
      }),
      "collider",
      collider.type,
    ]);
  }
}
