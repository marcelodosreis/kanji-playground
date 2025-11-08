import type { Engine, EngineGameObj } from "../../types/engine.interface";
import type { TiledObject } from "../../types/tiled-map.interface";
import type { BossBarrier } from "../../types/map.interface";
import { MAP_TAGS, TAGS } from "../../types/tags.enum";
import { GLOBAL_STATE_CONTROLLER } from "../global-state-controller";
import { GLOBAL_STATE } from "../../types/state.interface";
import { smoothTransition } from "../../utils/smooth-transition";

export function BossBarrierSystem(params: {
  engine: Engine;
  bossBarrier: EngineGameObj;
  collider: TiledObject;
}): void {
  const { engine, bossBarrier, collider } = params;

  const createActivate = () => {
    const currentState = GLOBAL_STATE_CONTROLLER.current();
    return function activate(this: BossBarrier) {
      if (currentState.isPlayerInBossFight || currentState.isBossDefeated)
        return;
      smoothTransition({
        engine,
        startValue: engine.camPos().x,
        endValue: Number(collider.properties?.[0]?.value ?? engine.camPos().x),
        durationSeconds: 1,
        onUpdate: (val) => engine.camPos(val, engine.camPos().y),
        easingFunction: engine.easings.linear,
      });
    };
  };

  const createDeactivate = () => {
    const currentState = GLOBAL_STATE_CONTROLLER.current();
    return async function deactivate(this: BossBarrier, playerPosX: number) {
      if (currentState.isPlayerInBossFight || currentState.isBossDefeated)
        return;

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
  };

  const actions = {
    activate: createActivate(),
    deactivate: createDeactivate(),
  };

  const extended = bossBarrier as unknown as BossBarrier;
  extended.activate = actions.activate.bind(extended);
  extended.deactivate = actions.deactivate.bind(extended);

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
