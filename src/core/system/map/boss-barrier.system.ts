import type { Engine, EngineGameObj } from "../../../types/engine.type";
import type { TiledObject } from "../../../types/tiled-map.interface";
import type { BossBarrier } from "../../../types/map.interface";
import { MAP_TAGS, TAGS } from "../../../types/tags.enum";
import { GLOBAL_STATE_CONTROLLER } from "../../global-state-controller";
import { GLOBAL_STATE } from "../../../types/global-state.enum";
import { smoothTransition } from "../../../utils/smooth-transition";

type Params = {
  engine: Engine;
  bossBarrier: EngineGameObj;
  collider: TiledObject;
};

export function BossBarrierSystem(params: Params): void {
  const { engine, bossBarrier, collider } = params;

  extendWithActions(bossBarrier, engine, collider);
  setupCollisionHandlers(bossBarrier, engine);
}

function extendWithActions(
  bossBarrier: EngineGameObj,
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
  bossBarrier: EngineGameObj,
  engine: Engine
): void {
  const extended = bossBarrier as unknown as BossBarrier;

  extended.onCollide(TAGS.PLAYER, (player: EngineGameObj) => {
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

export function isBossBarrier(collider: TiledObject): boolean {
  return collider.name === MAP_TAGS.BOSS_BARRIER;
}
