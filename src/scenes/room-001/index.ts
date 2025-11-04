import { state } from "../../core/state";
import { createBoss } from "../../entities/boss";
import { createDrone } from "../../entities/drone";
import { createCartridge } from "../../entities/cartridge";
import { createPlayer } from "../../entities/player";
import { type Boss } from "../../types/boss";
import type { Enemy } from "../../types/enemy";
import type { Engine } from "../../types/engine";
import type { Map } from "../../types/map";
import { type Player } from "../../types/player";
import type { TiledMap, TiledObject } from "../../types/tiled-map";

import { setBackgroundColor } from "../../utils/set-background-color";
import { setCameraControl } from "../../utils/set-camera-control";
import { setCameraZOnes } from "../../utils/set-camera-zones";
import { setMapCollider } from "../../utils/set-map-collider";
import { healthBar } from "../../utils/create-health-bar";

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
      player.respawnIfOutOfBounds(1000, "room001")
      continue;
    }

    if (position.type === "drone") {
      const drone = map.add<Enemy>(
        createDrone(engine, engine.vec2(position.x, position.y))
      );
      drone.setBehavior();
      drone.setEvents();
    }

    if (position.name === "boss" && !state.current().isBossDefeated) {
      const boss = map.add<Boss>(
        createBoss(engine, engine.vec2(position.x, position.y))
      );
      boss.setBehavior();
      boss.setEvents();
    }

    if (position.type === "cartridge") {
      map.add(createCartridge(engine, engine.vec2(position.x, position.y)));
    }
  }

  healthBar.setEvents();
  healthBar.trigger("update");
  engine.add(healthBar);
}
