import type { Engine } from "../types/engine";
import type { Map } from "../types/map";
import type { TiledObject } from "../types/tiled-map";

export function setExitZones(
  engine: Engine,
  map: Map,
  exits: TiledObject[],
  destinationName: string
) {
  for (const exit of exits) {
    const exitZone = map.add([
      engine.pos(exit.x, exit.y),
      engine.area({
        shape: new engine.Rect(engine.vec2(0), exit.width, exit.height),
        collisionIgnore: ["collider"],
      }),
      engine.body({ isStatic: true }),
      exit.name,
    ]);

    exitZone.onCollide("player", async () => {
      console.log("DEBUG",exit);


      const background = await engine.add([
        engine.pos(-engine.width(), 0),
        engine.rect(engine.width(), engine.height()),
        engine.color("#20214a"),
      ]);

      await engine.tween(
        background.pos.x,
        0,
        0.3,
        (val) => (background.pos.x = val),
        engine.easings.linear
      );

      if (exit.name === "final-exit") {
        engine.go("final-exit");
        return;
      }

      engine.go(destinationName, { exitName: exit.name });
    });
  }
}
