import type { Engine } from "../../types/engine";
import type { Map } from "../../types/map";
import type { TiledMap, TiledObject } from "../../types/tiled-map";

type SetupParams = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
  exitsLayerIndex: number;
  exitRoomName: string;
};

export class ExitManager {
  static setup(params: SetupParams): void {
    const { engine, map, tiledMap, exitsLayerIndex, exitRoomName } = params;

    const exits = tiledMap.layers[exitsLayerIndex].objects as TiledObject[];
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
        const camPos = engine.camPos();

        const background = engine.add([
          engine.pos(camPos.x - engine.width(), camPos.y - engine.height() / 2),
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

        engine.go(exitRoomName, { exitName: exit.name });
      });
    }
  }
}
