import type { Engine, EngineGameObj } from "../../types/engine.interface";
import type { Map, BossBarrier } from "../../types/map.interface";
import type { TiledObject } from "../../types/tiled-map.interface";
import { state } from "../state";

export class BossBarrierManager {
  public static setup(engine: Engine, map: Map, collider: TiledObject): void {
    const bossBarrier = this.createBossBarrierEntity(engine, map, collider);
    this.setupCollisionHandlers(engine, bossBarrier);
  }

  public static isBossBarrier(collider: TiledObject): boolean {
    return collider.name === "boss-barrier";
  }

  private static createBossBarrierEntity(
    engine: Engine,
    map: Map,
    collider: TiledObject
  ): BossBarrier {
    return map.add([
      engine.rect(collider.width, collider.height),
      engine.color(engine.Color.fromHex("#eacfba")),
      engine.pos(collider.x, collider.y),
      engine.area({ collisionIgnore: ["collider"] }),
      engine.opacity(0),
      "boss-barrier",
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

      engine.tween(
        this.opacity,
        0.3,
        1,
        (val) => (this.opacity = val),
        engine.easings.linear
      );
      engine.tween(
        engine.camPos().x,
        collider.properties[0].value,
        1,
        (val) => engine.camPos(val, engine.camPos().y),
        engine.easings.linear
      );
    };
  }

  private static createDeactivate(engine: Engine) {
    const currentState = state.current();

    return async function deactivate(this: BossBarrier, playerPosX: number) {
      if (currentState.isPlayerInBossFight || currentState.isBossDefeated)
        return;

      engine.tween(
        this.opacity,
        0,
        1,
        (val) => (this.opacity = val),
        engine.easings.linear
      );
      await engine.tween(
        engine.camPos().x,
        playerPosX,
        1,
        (val) => engine.camPos(val, engine.camPos().y),
        engine.easings.linear
      );
      engine.destroy(this);
    };
  }

  private static setupCollisionHandlers(
    engine: Engine,
    bossBarrier: BossBarrier
  ): void {
    bossBarrier.onCollide("player", (player: EngineGameObj) =>
      this.handlePlayerCollide(bossBarrier, player)
    );

    bossBarrier.onCollideEnd("player", () =>
      this.handlePlayerCollideEnd(engine, bossBarrier)
    );
  }

  private static async handlePlayerCollide(
    bossBarrier: BossBarrier,
    player: EngineGameObj
  ): Promise<void> {
    const currentState = state.current();

    if (currentState.isBossDefeated) {
      state.set("isPlayerInBossFight", false);
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

    state.set("isPlayerInBossFight", true);
    bossBarrier.activate();
    bossBarrier.use(engine.body({ isStatic: true }));
  }
}
