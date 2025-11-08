import type { Engine } from "../../types/engine.interface";
import type { TiledObject } from "../../types/tiled-map.interface";
import { MAP_TAGS } from "../../types/tags.enum";

export function BossBarrierEntity(
  engine: Engine,
  collider: TiledObject
): unknown[] {
  const colorHex = "#000000";
  return [
    MAP_TAGS.BOSS_BARRIER,
    engine.rect(collider.width, collider.height),
    engine.color(engine.Color.fromHex(colorHex)),
    engine.pos(collider.x, collider.y),
    engine.area({ collisionIgnore: [MAP_TAGS.COLLIDER] }),
    engine.opacity(0),
  ];
}
