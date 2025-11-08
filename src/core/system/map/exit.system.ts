import type { Engine } from "../../../types/engine.type";
import type { Map } from "../../../types/map.interface";
import { MENU_SCENES } from "../../../types/scenes.enum";
import { MAP_TAGS, TAGS } from "../../../types/tags.enum";
import type { TiledMap, TiledObject } from "../../../types/tiled-map.interface";
import { MapLayer, MapLayerHelper } from "../../../utils/map-layer-helper";
import { screenFadeIn } from "../../../utils/screen-fade-in";

type ExitSystemParams = {
  engine: Engine;
  map: Map;
  tiledMap: TiledMap;
  exitRoomName?: string;
};

export function ExitSystem(params: ExitSystemParams): void {
  const { engine, map, tiledMap, exitRoomName } = params;
  const exits = MapLayerHelper.getObjects(tiledMap, MapLayer.EXIT);
  exits.forEach((exit) => createExitZone({ engine, map, exitRoomName }, exit));
}

function createExitZone(
  params: { engine: Engine; map: Map; exitRoomName?: string },
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

  exitZone.onCollide(TAGS.PLAYER, () => handlePlayerExit(params, exit));
}

async function handlePlayerExit(
  params: { engine: Engine; exitRoomName?: string },
  exit: TiledObject
): Promise<void> {
  const { engine, exitRoomName } = params;

  if (!exitRoomName) {
    console.error(
      "ExitSystem: exitRoomName is undefined, aborting navigation",
      { exitName: exit.name }
    );
    return;
  }

  const duration = 0.4;

  await screenFadeIn({
    engine,
    durationSeconds: duration,
  });

  if (exit.name === MENU_SCENES.FINAL) {
    engine.go(MENU_SCENES.FINAL);
    return;
  }

  engine.go(exitRoomName, { exitName: exit.name });
}
