import { state } from "../core/state";
import type { Engine } from "../types/engine";
import type { Map, BossBarrier } from "../types/map";
import type { TiledObject } from "../types/tiled-map";

export function setMapCollider(
  engine: Engine,
  map: Map,
  colliders: TiledObject[]
) {
  for (const collider of colliders) {
    if (collider?.polygon) {
      const coordinates = [];
      for (const point of collider?.polygon) {
        coordinates.push(engine.vec2(point.x, point.y));
      }

      map.add([
        engine.pos(collider.x, collider.y),
        engine.area({
          shape: new engine.Polygon(coordinates),
          collisionIgnore: ["collider"],
        }),
        engine.body({ isStatic: true }),
        "collider",
        collider.type,
      ]);
      continue;
    }

    if (collider.name === "boss-barrier") {
      const bossBarrier = map.add([
        engine.rect(collider.width, collider.height),
        engine.color(engine.Color.fromHex("#eacfba")),
        engine.pos(collider.x, collider.y),
        engine.area({
          collisionIgnore: ["collider"],
        }),
        engine.opacity(0),
        "boss-barrier",
        {
          activate(this: BossBarrier) {
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
          },
          async deactivate(this: BossBarrier, playerPosX: number) {
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
          },
        },
      ]);
      bossBarrier.onCollide("player", async (player) => {
        const currentState = state.current();
        if (currentState.isBossDefeated) {
          state.set("isPlayerInBossFight", false);
          bossBarrier.deactivate(player.pos.x);
          return;
        }

        if (currentState.isPlayerInBossFight) return;
        player.disableControls();
        player.play("idle");
        await engine.tween(
          player.pos.x,
          player.pos.x + 25,
          0.2,
          (val) => (player.pos.x = val),
          engine.easings.linear
        );
        player.setControls();
      });

      bossBarrier.onCollideEnd("player", () => {
        const currentState = state.current();
        if (currentState.isPlayerInBossFight || currentState.isBossDefeated)
          return;

        state.set("isPlayerInBossFight", true);

        bossBarrier.activate();
        bossBarrier.use(engine.body({ isStatic: true }));
      });

      continue;
    }

    map.add([
      engine.pos(collider.x, collider.y),
      engine.area({
        shape: new engine.Rect(engine.vec2(0), collider.width, collider.height),
        collisionIgnore: ["collider"],
      }),
      engine.body({
        isStatic: true,
      }),
      "collider",
      collider.type,
    ]);
  }
}
