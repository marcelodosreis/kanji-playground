import { COLORS } from "../../types/colors.enum";
import type { Engine } from "../../types/engine.interface";
import type { Map } from "../../types/map.interface";
import { MENU_SCENES } from "../../types/scenes.enum";
import { MAP_TAGS, TAGS } from "../../types/tags.enum";
import type { TiledMap, TiledObject } from "../../types/tiled-map.interface";
import { smoothTransition } from "../../utils/smooth-transition";

type SetupParams = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
  exitsLayerIndex: number;
  exitRoomName: string;
};

export class ExitManager {
  public static setup({
    engine,
    map,
    tiledMap,
    exitsLayerIndex,
    exitRoomName,
  }: SetupParams): void {
    const exits = this.getExits(tiledMap, exitsLayerIndex);
    exits.forEach((exit) =>
      this.createExitZone({ engine, map, exitRoomName }, exit)
    );
  }

  private static getExits(
    tiledMap: TiledMap,
    layerIndex: number
  ): TiledObject[] {
    return tiledMap.layers[layerIndex].objects as TiledObject[];
  }

  private static createExitZone(
    params: { engine: Engine; map: Map; exitRoomName: string },
    exit: TiledObject
  ): void {
    const { engine, map } = params;
    const exitZone = map.add([
      engine.pos(exit.x, exit.y),
      engine.area({
        shape: new engine.Rect(engine.vec2(0), exit.width, exit.height),
        collisionIgnore: [MAP_TAGS.COLLIDER],
      }),
      engine.body({ isStatic: true }),
      exit.name,
    ]);

    exitZone.onCollide(TAGS.PLAYER, () => this.handlePlayerExit(params, exit));
  }

  private static async handlePlayerExit(
    params: { engine: Engine; exitRoomName: string },
    exit: TiledObject
  ): Promise<void> {
    const { engine, exitRoomName } = params;

    const background = this.createBackground(engine);

    const duration = 0.4;

    await this.tweenBackgroundToRight(engine, background, duration);

    if (exit.name === MENU_SCENES.FINAL) {
      engine.go(MENU_SCENES.FINAL);
      return;
    }

    engine.go(exitRoomName, { exitName: exit.name });
  }

  private static createBackground(engine: Engine) {
    return engine.add([
      engine.pos(-engine.width(), 0),
      engine.fixed(), 
      engine.rect(engine.width(), engine.height()),
      engine.color(COLORS.BACKGROUND_PRIMARY),
      engine.z(9999), 
    ]);
  }

  private static tweenBackgroundToRight(
    engine: Engine,
    background: any,
    durationSeconds = 1
  ): Promise<void> {
    return new Promise((resolve) => {
      const startX = background.pos.x;
      const endX = 0; 
      const totalMs = durationSeconds * 1000;

      smoothTransition({
        engine,
        startValue: startX,
        endValue: endX,
        durationSeconds,
        onUpdate: (val) => (background.pos.x = val),
        easingFunction: engine.easings.linear,
      });

      setTimeout(resolve, totalMs + 50);
    });
  }
}