import type { Engine } from "../../../types/engine.type";
import type { Map, BossBarrier } from "../../../types/map.interface";
import type { TiledMap, TiledObject } from "../../../types/tiled-map.interface";
import { MapLayer, MapLayerHelper } from "../../../utils/map-layer-helper";
import { MAP_TAGS, TAGS } from "../../../types/tags.enum";
import { BossBarrierEntity } from "../../entities/boss-barrier.entity";
import { GLOBAL_STATE_CONTROLLER } from "../../global-state-controller";
import { GLOBAL_STATE } from "../../../types/global-state.enum";
import { smoothTransition } from "../../../utils/smooth-transition";
import type { Player } from "../../../types/player.interface";

type BossBarrierParams = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
};

const isBossBarrier = (obj: TiledObject): boolean =>
  obj?.name === MAP_TAGS.BOSS_BARRIER;

const shouldActivateBarrier = (): boolean => {
  const state = GLOBAL_STATE_CONTROLLER.current();
  return !state.isPlayerInBossFight && !state.isBossDefeated;
};

const shouldDeactivateBarrier = (): boolean => {
  const state = GLOBAL_STATE_CONTROLLER.current();
  return state.isBossDefeated;
};

const isInBossFight = (): boolean =>
  GLOBAL_STATE_CONTROLLER.current().isPlayerInBossFight;

const getCameraTargetX = (collider: TiledObject, fallback: number): number =>
  Number(collider.properties?.[0]?.value ?? fallback);

export function BossBarrierSystem({
  engine,
  map,
  tiledMap,
}: BossBarrierParams): void {
  const objects = MapLayerHelper.getObjects(tiledMap, MapLayer.COLLIDERS);
  const barriers = objects.filter(isBossBarrier);

  barriers.forEach((collider) => {
    const barrier = createBarrier(engine, map, collider);
    setupBarrierBehavior(engine, barrier, collider);
  });
}

function createBarrier(
  engine: Engine,
  map: Map,
  collider: TiledObject
): BossBarrier {
  return map.add(BossBarrierEntity(engine, collider)) as unknown as BossBarrier;
}

function setupBarrierBehavior(
  engine: Engine,
  barrier: BossBarrier,
  collider: TiledObject
): void {
  extendBarrierWithActions(engine, barrier, collider);
  setupBarrierCollisions(engine, barrier);
}

function extendBarrierWithActions(
  engine: Engine,
  barrier: BossBarrier,
  collider: TiledObject
): void {
  barrier.activate = function () {
    if (!shouldActivateBarrier()) return;

    const targetX = getCameraTargetX(collider, engine.camPos().x);

    smoothTransition({
      engine,
      startValue: engine.camPos().x,
      endValue: targetX,
      durationSeconds: 1,
      onUpdate: (val) => engine.camPos(val, engine.camPos().y),
      easingFunction: engine.easings.linear,
    });
  };

  barrier.deactivate = async function (playerPosX: number) {
    if (!shouldDeactivateBarrier()) return;

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

function setupBarrierCollisions(engine: Engine, barrier: BossBarrier): void {
  barrier.onCollide(TAGS.PLAYER, (player: Player) => {
    if (shouldDeactivateBarrier()) {
      GLOBAL_STATE_CONTROLLER.set(GLOBAL_STATE.IS_PLAYER_IN_BOSS_FIGHT, false);
      barrier.deactivate(player.pos.x);
      return;
    }

    if (isInBossFight()) return;
  });

  barrier.onCollideEnd(TAGS.PLAYER, () => {
    if (isInBossFight() || shouldDeactivateBarrier()) return;

    barrier.activate();
    GLOBAL_STATE_CONTROLLER.set(GLOBAL_STATE.IS_PLAYER_IN_BOSS_FIGHT, true);
    barrier.use(engine.body({ isStatic: true }));
  });
}
