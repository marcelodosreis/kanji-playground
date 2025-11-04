import { createDrone } from "../../entities/drone";
import { createPlayer } from "../../entities/player";
import type { Enemy } from "../../types/enemy";
import type { Engine } from "../../types/engine";
import type { Map } from "../../types/map";
import { type Player } from "../../types/player";
import type { TiledMap, TiledObject } from "../../types/tiled-map";

import { setBackgroundColor } from "../../utils/set-background-color";
import { setCameraControl } from "../../utils/set-camera-control";
import { setCameraZOnes } from "../../utils/set-camera-zones";
import { setMapCollider } from "../../utils/set-map-collider";

export function room001(engine: Engine, tiledMap: TiledMap) {
  setBackgroundColor(engine, "#a2aed5");

  const layers = tiledMap.layers;

  const map: Map = engine.add([engine.pos(0, 0), engine.sprite("room001")]);

  const colliders: TiledObject[] = layers[4].objects || [];
  const positions: TiledObject[] = [];
  const cameras: TiledObject[] = [];

  for (const layer of layers) {
    if (layer.name === "cameras" && layer.objects) {
      cameras.push(...layer.objects);
    }
    if (layer.name === "positions" && layer.objects) {
      positions.push(...layer.objects);
      continue;
    }
    if (layer.name === "colliders" && layer.objects) {
      colliders?.push(...layer.objects);
    }
  }

  setMapCollider(engine, map, colliders);
  setCameraZOnes(engine, map, cameras);

  engine.camScale(2);
  engine.camPos(170, 100);
  engine.setGravity(1000);

  const player = engine.add<Player>(createPlayer(engine));
  setCameraControl(engine, map, player, tiledMap);

  for (const position of positions) {
    if (position.name === "player") {
      player.setPosition(position.x, position.y);
      player.setControls();
      player.setEvents();
      player.enablePassthrough();
      continue;
    }

    if (position.type === "drone") {
      const drone = map.add<Enemy>(
        createDrone(engine, engine.vec2(position.x, position.y))
      );
      drone.setBehavior();
      drone.setEvents();
    }
  }
}
