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
    const exits = this.getExits(params.tiledMap, params.exitsLayerIndex);
    exits.forEach((exit) => this.createExitZone(params, exit));
  }

  private static getExits(
    tiledMap: TiledMap,
    layerIndex: number
  ): TiledObject[] {
    return tiledMap.layers[layerIndex].objects as TiledObject[];
  }

  private static createExitZone(params: SetupParams, exit: TiledObject): void {
    const { engine, map } = params;
    const exitZone = map.add([
      engine.pos(exit.x, exit.y),
      engine.area({
        shape: new engine.Rect(engine.vec2(0), exit.width, exit.height),
        collisionIgnore: ["collider"],
      }),
      engine.body({ isStatic: true }),
      exit.name,
    ]);

    exitZone.onCollide("player", () => this.handlePlayerExit(params, exit));
  }

  private static async handlePlayerExit(
    params: SetupParams,
    exit: TiledObject
  ): Promise<void> {
    const { engine, exitRoomName } = params;
    const camPos = engine.camPos();

    const background = this.createBackground(engine, camPos);
    await this.tweenBackgroundToZero(engine, background);

    if (exit.name === "final-exit") {
      engine.go("final-exit");
      return;
    }

    engine.go(exitRoomName, { exitName: exit.name });
  }

  private static createBackground(
    engine: Engine,
    camPos: { x: number; y: number }
  ) {
    return engine.add([
      engine.pos(camPos.x - engine.width(), camPos.y - engine.height() / 2),
      engine.rect(engine.width(), engine.height()),
      engine.color("#20214a"),
    ]);
  }

  private static tweenBackgroundToZero(
    engine: Engine,
    background: any
  ): Promise<void> {
    return new Promise((resolve) => {
      engine.tween(
        background.pos.x,
        0,
        0.3,
        (val) => (background.pos.x = val),
        engine.easings.linear
      );
      setTimeout(resolve, 400);
    });
  }
}
