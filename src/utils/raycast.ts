import type { Vec2 } from "kaplay";
import { engine } from "../core/engine";
import type {
  CollidersEngineGameObj,
  EngineGameObj,
} from "../types/engine.type";

interface RaycastParams {
  origin: EngineGameObj;
  target: EngineGameObj;
  colliders: CollidersEngineGameObj[];
}

export function hasObstacleBetweenObjects({
  origin,
  target,
  colliders,
}: RaycastParams): boolean {
  const originPos = engine.vec2(origin.pos);
  const targetPos = engine.vec2(target.pos);
  const direction = targetPos.sub(originPos);
  const distance = direction.len();

  if (distance < 1e-4) return false;

  const hit = engine.raycast(originPos, direction.unit().scale(distance));
  if (hit && !isSameEntity(hit.object, origin, target)) return true;

  return colliders.some((c) => intersectsRect(originPos, targetPos, c));
}

function isSameEntity(obj: any, a: EngineGameObj, b: EngineGameObj) {
  return obj.is(a.tag) || obj.is(b.tag);
}

function intersectsRect(
  a: Vec2,
  b: Vec2,
  collider: CollidersEngineGameObj
): boolean {
  const area = collider.localArea();
  if (!area || !("pos" in area && "width" in area && "height" in area))
    return false;

  const pos = collider.pos.add(area.pos);
  const min = pos;
  const max = engine.vec2(pos.x + area.width, pos.y + area.height);
  const topRight = engine.vec2(max.x, min.y);
  const bottomLeft = engine.vec2(min.x, max.y);

  return (
    segIntersect(a, b, min, topRight) ||
    segIntersect(a, b, topRight, max) ||
    segIntersect(a, b, max, bottomLeft) ||
    segIntersect(a, b, bottomLeft, min)
  );
}

function segIntersect(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2) {
  const cross = (p: Vec2, q: Vec2, r: Vec2) =>
    (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const d1 = cross(a1, a2, b1);
  const d2 = cross(a1, a2, b2);
  const d3 = cross(b1, b2, a1);
  const d4 = cross(b1, b2, a2);
  return d1 * d2 < 0 && d3 * d4 < 0;
}
