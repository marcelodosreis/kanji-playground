import type { Engine } from "../../../types/engine.type";
import type { Map } from "../../../types/map.interface";
import type { TiledMap, TiledObject } from "../../../types/tiled-map.interface";
import { MapLayer, MapLayerHelper } from "../../../utils/map-layer-helper";
import { MAP_TAGS } from "../../../types/tags.enum";
import type { BossBarrier } from "../../../types/map.interface";
import { TAGS } from "../../../types/tags.enum";
import { GLOBAL_STATE_CONTROLLER } from "../../global-state-controller";
import { GLOBAL_STATE } from "../../../types/global-state.enum";
import { smoothTransition } from "../../../utils/smooth-transition";
import { BossBarrierEntity } from "../../entities/boss-barrier.entity";
import type { Player } from "../../../types/player.interface";

type Params = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
};

export function MapSystem({ engine, map, tiledMap }: Params): void {
  const objects = MapLayerHelper.getObjects(tiledMap, MapLayer.COLLIDERS);
  for (const obj of objects) {
    if (isBossBarrier(obj)) {
      const boss = map.add(BossBarrierEntity(engine, obj));
      setupBossBarrier({ engine, bossBarrier: boss, collider: obj });
      continue;
    }
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

function isPolygon(obj: TiledObject): boolean {
  return Boolean(obj?.polygon && obj.polygon.length > 0);
}

function isBossBarrier(obj: TiledObject): boolean {
  return obj?.name === MAP_TAGS.BOSS_BARRIER;
}

function polygonCoordinates(engine: Engine, obj: TiledObject) {
  return obj.polygon?.map((p) => engine.vec2(p.x, p.y));
}

function createPolygonArea(
  engine: Engine,
  coordinates: ReturnType<Engine["vec2"]>[]
) {
  return engine.area({
    shape: new engine.Polygon(coordinates),
    collisionIgnore: [MAP_TAGS.COLLIDER],
  });
}

function createRectArea(engine: Engine, obj: TiledObject) {
  return engine.area({
    shape: new engine.Rect(engine.vec2(0), obj.width, obj.height),
    collisionIgnore: [MAP_TAGS.COLLIDER],
  });
}

function createStaticBody(engine: Engine) {
  return engine.body({ isStatic: true });
}

function addCollider(
  map: Map,
  position: ReturnType<Engine["pos"]>,
  area: ReturnType<Engine["area"]>,
  body: ReturnType<Engine["body"]>,
  type?: string
): void {
  map.add([position, area, body, MAP_TAGS.COLLIDER, type]);
}

function setupBossBarrier(params: {
  engine: Engine;
  bossBarrier: ReturnType<Map["add"]>;
  collider: TiledObject;
}): void {
  const { engine, bossBarrier, collider } = params;
  extendWithActions(bossBarrier, engine, collider);
  setupCollisionHandlers(bossBarrier, engine);
}

function extendWithActions(
  bossBarrier: ReturnType<Map["add"]>,
  engine: Engine,
  collider: TiledObject
): void {
  const extended = bossBarrier as unknown as BossBarrier;
  extended.activate = createActivate(engine, collider).bind(extended);
  extended.deactivate = createDeactivate(engine).bind(extended);
}

function createActivate(engine: Engine, collider: TiledObject) {
  const currentState = GLOBAL_STATE_CONTROLLER.current();
  return function activate(this: BossBarrier) {
    if (currentState.isPlayerInBossFight || currentState.isBossDefeated) return;
    smoothTransition({
      engine,
      startValue: engine.camPos().x,
      endValue: Number(collider.properties?.[0]?.value ?? engine.camPos().x),
      durationSeconds: 1,
      onUpdate: (val) => engine.camPos(val, engine.camPos().y),
      easingFunction: engine.easings.linear,
    });
  };
}

function createDeactivate(engine: Engine) {
  const currentState = GLOBAL_STATE_CONTROLLER.current();
  return async function deactivate(this: BossBarrier, playerPosX: number) {
    if (currentState.isPlayerInBossFight || currentState.isBossDefeated) return;
    smoothTransition({
      engine,
      startValue: this.opacity,
      endValue: 0,
      durationSeconds: 1,
      onUpdate: (val) => (this.opacity = val),
      easingFunction: engine.easings.linear,
    });
    await smoothTransition({
      engine,
      startValue: engine.camPos().x,
      endValue: playerPosX,
      durationSeconds: 1,
      onUpdate: (val) => engine.camPos(val, engine.camPos().y),
      easingFunction: engine.easings.linear,
    });
    engine.destroy(this);
  };
}

function setupCollisionHandlers(
  bossBarrier: ReturnType<Map["add"]>,
  engine: Engine
): void {
  const extended = bossBarrier as unknown as BossBarrier;
  extended.onCollide(TAGS.PLAYER, (player: Player) => {
    const currentState = GLOBAL_STATE_CONTROLLER.current();
    if (currentState.isBossDefeated) {
      GLOBAL_STATE_CONTROLLER.set(GLOBAL_STATE.IS_PLAYER_IN_BOSS_FIGHT, false);
      extended.deactivate(player.pos.x);
      return;
    }
    if (currentState.isPlayerInBossFight) return;
  });
  extended.onCollideEnd(TAGS.PLAYER, () => {
    const currentState = GLOBAL_STATE_CONTROLLER.current();
    if (currentState.isPlayerInBossFight || currentState.isBossDefeated) return;
    GLOBAL_STATE_CONTROLLER.set(GLOBAL_STATE.IS_PLAYER_IN_BOSS_FIGHT, true);
    extended.activate();
    extended.use(engine.body({ isStatic: true }));
  });
}
