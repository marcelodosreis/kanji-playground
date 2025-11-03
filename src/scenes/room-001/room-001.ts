import type { Engine } from "../../types/engine";
import type { LoadedMap } from "../../types/map";
import type { TiledMap, TiledObject } from "../../types/tiledMap";

import { setBackgroundColor } from "../../utils/set-background-color";
import { setMapCollider } from "../../utils/set-map-collider";

export function room001(engine: Engine, tiledMap: TiledMap) {
  setBackgroundColor(engine, "#a2aed5");

  const layers = tiledMap.layers;

  const map: LoadedMap = engine.add([
    engine.pos(0, 0),
    engine.sprite("room001"),
  ]);

  const colliders: TiledObject[] = layers[4].objects || [];

  for (const layer of layers) {
    if (layer.name === "colliders" && layer.objects) {
      colliders?.push(...layer.objects);
      break;
    }
  }

  setMapCollider(engine, map, colliders);

  engine.camScale(2);
  engine.camPos(170, 100);
  engine.setGravity(1000);
}
