import type { Engine } from "../../types/engine";
import type { TiledMap } from "../../types/tiledMap";

import { setBackgroundColor } from "../../utils/set-background-color";

export function room001(engine: Engine, tiledMap: TiledMap) {
  setBackgroundColor(engine, "#a2aed5");
  const layers = tiledMap.layers;
  const map = engine.add([engine.pos(0, 0), engine.sprite("room001")]);
  const colliders = layers[4].objects;

  for (const layer of layers) {
    if (layer.name === "colliders" && layer.objects) {
      colliders?.push(...layer.objects);
      break;
    }
  }
}
