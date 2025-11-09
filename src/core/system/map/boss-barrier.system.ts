import type { Engine } from "../../../types/engine.type";
import type { Map, BossBarrier } from "../../../types/map.interface";
import type { TiledMap, TiledObject } from "../../../types/tiled-map.interface";
import { MapLayer, MapLayerHelper } from "../../../helpers/map-layer-helper";
import { MAP_TAGS, TAGS } from "../../../types/tags.enum";
import { BossBarrierEntity } from "../../entities/boss-barrier.entity";
import { GLOBAL_STATE_CONTROLLER } from "../../global-state-controller";
import { GLOBAL_STATE } from "../../../types/global-state.enum";
import { smoothTransition } from "../../../utils/smooth-transition";
import type { Player } from "../../../types/player.interface";

type Params = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
};

export function BossBarrierSystem({ engine, map, tiledMap }: Params): void {
  const colliders = MapLayerHelper.getObjects(tiledMap, MapLayer.COLLIDERS);
  const barriers = colliders.filter(isBossBarrier);

  for (const collider of barriers) {
    const barrier = createBarrier(engine, map, collider);
    attachBarrierLogic(engine, barrier, collider);
  }
}

function isBossBarrier(obj: TiledObject): boolean {
  return obj?.name === MAP_TAGS.BOSS_BARRIER;
}

function createBarrier(
  engine: Engine,
  map: Map,
  collider: TiledObject
): BossBarrier {
  return map.add(BossBarrierEntity(engine, collider)) as unknown as BossBarrier;
}

function attachBarrierLogic(
  engine: Engine,
  barrier: BossBarrier,
  collider: TiledObject
): void {
  barrier.activate = createActivateAction(engine, collider);
  barrier.deactivate = createDeactivateAction(engine);
  setupCollisions(engine, barrier);
}

function createActivateAction(engine: Engine, collider: TiledObject) {
  return function activate(this: BossBarrier) {
    if (!canActivate()) return;

    const targetX = getCameraTargetX(collider, engine.camPos().x);

    smoothTransition({
      engine,
      startValue: engine.camPos().x,
      endValue: targetX,
      durationSeconds: 1,
      onUpdate: (x) => engine.camPos(x, engine.camPos().y),
      easingFunction: engine.easings.linear,
    });
  };
}

function createDeactivateAction(engine: Engine) {
  return async function deactivate(this: BossBarrier, playerPosX: number) {
    if (!canDeactivate()) return;

    smoothTransition({
      engine,
      startValue: this.opacity,
      endValue: 0,
      durationSeconds: 1,
      onUpdate: (v) => (this.opacity = v),
      easingFunction: engine.easings.linear,
    });

    await smoothTransition({
      engine,
      startValue: engine.camPos().x,
      endValue: playerPosX,
      durationSeconds: 1,
      onUpdate: (x) => engine.camPos(x, engine.camPos().y),
      easingFunction: engine.easings.linear,
    });

    engine.destroy(this);
  };
}

function setupCollisions(engine: Engine, barrier: BossBarrier): void {
  barrier.onCollide(TAGS.PLAYER, (player: Player) => {
    if (canDeactivate()) {
      GLOBAL_STATE_CONTROLLER.set(GLOBAL_STATE.IS_PLAYER_IN_BOSS_FIGHT, false);
      barrier.deactivate(player.pos.x);
      return;
    }
    if (isInBossFight()) return;
  });

  barrier.onCollideEnd(TAGS.PLAYER, () => {
    if (isInBossFight() || canDeactivate()) return;

    barrier.activate();
    GLOBAL_STATE_CONTROLLER.set(GLOBAL_STATE.IS_PLAYER_IN_BOSS_FIGHT, true);
    barrier.use(engine.body({ isStatic: true }));
  });
}

function canActivate(): boolean {
  const s = GLOBAL_STATE_CONTROLLER.current();
  return !s.isPlayerInBossFight && !s.isBossDefeated;
}

function canDeactivate(): boolean {
  return GLOBAL_STATE_CONTROLLER.current().isBossDefeated;
}

function isInBossFight(): boolean {
  return GLOBAL_STATE_CONTROLLER.current().isPlayerInBossFight;
}

function getCameraTargetX(collider: TiledObject, fallback: number): number {
  return Number(collider.properties?.[0]?.value ?? fallback);
}
