import type { Engine, EngineGameObj } from "../../types/engine.interface";
import type { Map, BossBarrier } from "../../types/map.interface";
import { GLOBAL_STATE } from "../../types/state.interface";
import { MAP_TAGS, TAGS } from "../../types/tags.enum";
import type { TiledObject } from "../../types/tiled-map.interface";
import { smoothTransition } from "../../utils/smooth-transition";
import { state } from "../global-state-controller";

export class BossBarrierManager {
  public static setup(engine: Engine, map: Map, collider: TiledObject): void {
    const bossBarrier = this.createBossBarrierEntity(engine, map, collider);
    this.setupCollisionHandlers(engine, bossBarrier);
  }

  public static isBossBarrier(collider: TiledObject): boolean {
    return collider.name === MAP_TAGS.BOSS_BARRIER;
  }

  private static createBossBarrierEntity(
    engine: Engine,
    map: Map,
    collider: TiledObject
  ): BossBarrier {
    return map.add([
      MAP_TAGS.BOSS_BARRIER,
      engine.rect(collider.width, collider.height),
      engine.color(engine.Color.fromHex("#000000")),
      engine.pos(collider.x, collider.y),
      engine.area({ collisionIgnore: [MAP_TAGS.COLLIDER] }),
      engine.opacity(0),
      this.createActions(engine, collider),
    ]);
  }

  private static createActions(engine: Engine, collider: TiledObject) {
    return {
      activate: this.createActivate(engine, collider),
      deactivate: this.createDeactivate(engine),
    };
  }

  private static createActivate(engine: Engine, collider: TiledObject) {
    const currentState = state.current();

    return function activate(this: BossBarrier) {
      if (currentState.isPlayerInBossFight || currentState.isBossDefeated)
        return;
      smoothTransition({
        engine,
        startValue: engine.camPos().x,
        endValue: Number(collider.properties[0].value),
        durationSeconds: 1,
        onUpdate: (val) => engine.camPos(val, engine.camPos().y),
        easingFunction: engine.easings.linear,
      });
    };
  }

  private static createDeactivate(engine: Engine) {
    const currentState = state.current();

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
  }

  private static setupCollisionHandlers(
    engine: Engine,
    bossBarrier: BossBarrier
  ): void {
    bossBarrier.onCollide(TAGS.PLAYER, (player: EngineGameObj) =>
      this.handlePlayerCollide(bossBarrier, player)
    );

    bossBarrier.onCollideEnd(TAGS.PLAYER, () =>
      this.handlePlayerCollideEnd(engine, bossBarrier)
    );
  }

  private static async handlePlayerCollide(
    bossBarrier: BossBarrier,
    player: EngineGameObj
  ): Promise<void> {
    const currentState = state.current();

    if (currentState.isBossDefeated) {
      state.set(GLOBAL_STATE.IS_PLAYER_IN_BOSS_FIGHT, false);
      bossBarrier.deactivate(player.pos.x);
      return;
    }

    if (currentState.isPlayerInBossFight) return;
  }

  private static handlePlayerCollideEnd(
    engine: Engine,
    bossBarrier: BossBarrier
  ): void {
    const currentState = state.current();

    if (currentState.isPlayerInBossFight || currentState.isBossDefeated) return;

    state.set(GLOBAL_STATE.IS_PLAYER_IN_BOSS_FIGHT, true);
    bossBarrier.activate();
    bossBarrier.use(engine.body({ isStatic: true }));
  }
}
