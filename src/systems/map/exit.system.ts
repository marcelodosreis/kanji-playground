import type { Engine } from "../../types/engine.type";
import type { Map } from "../../types/map.interface";
import { MENU_SCENES } from "../../types/scenes.enum";
import { MAP_TAGS, TAGS } from "../../types/tags.enum";
import type { TiledMap, TiledObject } from "../../types/tiled-map.interface";
import { MapLayer, MapLayerHelper } from "../../helpers/map-layer-helper";
import { screenFadeIn } from "../../utils/screen-fade-in";

type ExitSystemParams = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
  exitRoomName?: string;
};

export function ExitSystem(params: ExitSystemParams): void {
  const exits = MapLayerHelper.getObjects(params.tiledMap, MapLayer.EXIT);
  exits.forEach((exit) => registerExitZone(params, exit));
}

function registerExitZone(
  { engine, map, exitRoomName }: ExitSystemParams,
  exit: TiledObject
): void {
  const area = engine.area({
    shape: new engine.Rect(engine.vec2(0), exit.width, exit.height),
    collisionIgnore: [MAP_TAGS.COLLIDER],
  });

  const body = engine.body({ isStatic: true });

  const exitZone = map.add([
    engine.pos(exit.x, exit.y),
    area,
    body,
    exit.name,
  ]);

  exitZone.onCollide(TAGS.PLAYER, () =>
    triggerExitTransition(engine, exit, exitRoomName)
  );
}

async function triggerExitTransition(
  engine: Engine,
  exit: TiledObject,
  exitRoomName?: string
): Promise<void> {
  if (!exitRoomName) {
    console.error(
      "ExitSystem: exitRoomName is undefined, aborting navigation",
      { exitName: exit.name }
    );
    return;
  }

  const fadeDuration = 0.4;

  await screenFadeIn({
    engine,
    durationSeconds: fadeDuration,
  });

  navigateToNextScene(engine, exit, exitRoomName);
}

function navigateToNextScene(
  engine: Engine,
  exit: TiledObject,
  exitRoomName: string
): void {
  if (exit.name === MENU_SCENES.FINAL) {
    engine.go(MENU_SCENES.FINAL);
  } else {
    engine.go(exitRoomName, { exitName: exit.name });
  }
}
