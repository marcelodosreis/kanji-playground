import type { Engine } from "../../../types/engine";
import type { Map } from "../../../types/map";
import type { TiledObject } from "../../../types/tiled-map";
import type { Vec2 } from "kaplay";

export class ColliderManager {
  static processColliders(
    engine: Engine,
    map: Map,
    colliders: TiledObject[]
  ): void {
    colliders.forEach((collider) =>
      this.processCollider(engine, map, collider)
    );
  }

  private static processCollider(
    engine: Engine,
    map: Map,
    collider: TiledObject
  ): void {
    if (this.isPolygonCollider(collider)) {
      this.addPolygonCollider(engine, map, collider);
      return;
    }

    if (this.isBossBarrier(collider)) {
      return;
    }

    this.addRectCollider(engine, map, collider);
  }

  static isPolygonCollider(collider: TiledObject): boolean {
    return Boolean(collider?.polygon);
  }

  static isBossBarrier(collider: TiledObject): boolean {
    return collider.name === "boss-barrier";
  }

  private static addPolygonCollider(
    engine: Engine,
    map: Map,
    collider: TiledObject
  ): void {
    const coordinates = this.getPolygonCoordinates(engine, collider);
    if (!coordinates) return;

    const polygonArea = this.createPolygonArea(engine, coordinates);
    const body = this.createStaticBody(engine);

    this.addColliderToMap(
      map,
      engine.pos(collider.x, collider.y),
      polygonArea,
      body,
      collider.type
    );
  }

  private static getPolygonCoordinates(
    engine: Engine,
    collider: TiledObject
  ): Vec2[] | undefined {
    return collider.polygon?.map((point) => engine.vec2(point.x, point.y));
  }

  private static createPolygonArea(engine: Engine, coordinates: Vec2[]) {
    return engine.area({
      shape: new engine.Polygon(coordinates),
      collisionIgnore: ["collider"],
    });
  }

  private static createStaticBody(engine: Engine) {
    return engine.body({ isStatic: true });
  }

  private static addRectCollider(
    engine: Engine,
    map: Map,
    collider: TiledObject
  ): void {
    const rectArea = this.createRectArea(engine, collider);
    const body = this.createStaticBody(engine);

    this.addColliderToMap(
      map,
      engine.pos(collider.x, collider.y),
      rectArea,
      body,
      collider.type
    );
  }

  private static createRectArea(engine: Engine, collider: TiledObject) {
    return engine.area({
      shape: new engine.Rect(engine.vec2(0), collider.width, collider.height),
      collisionIgnore: ["collider"],
    });
  }

  private static addColliderToMap(
    map: Map,
    position: ReturnType<Engine["pos"]>,
    area: ReturnType<Engine["area"]>,
    body: ReturnType<Engine["body"]>,
    type?: string
  ): void {
    map.add([position, area, body, "collider", type]);
  }
}
