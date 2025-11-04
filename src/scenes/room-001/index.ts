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
import { setCameraZones } from "../../utils/set-camera-zones";
import { setMapCollider } from "../../utils/set-map-collider";
import { healthBar } from "../../utils/create-health-bar";
import type { GameObj } from "kaplay";
import { setExitZones } from "../../utils/set-exit-zones";

export function room001(
  engine: Engine,
  tiledMap: TiledMap,
  prevSceneData: GameObj
) {
  setBackgroundColor(engine, "#a2aed5");

  engine.camScale(2);
  engine.camPos(170, 100);
  engine.setGravity(1000);

  const roomLayers = tiledMap.layers;

  const map = engine.add([engine.pos(0, 0), engine.sprite("room001")]);
  const colliders = roomLayers[4].objects as TiledObject[];

  setMapCollider(engine, map, colliders);

  const player = map.add<Player>(createPlayer(engine));

  setCameraControl(engine, map, player, tiledMap);

  const positions = roomLayers[5].objects as TiledObject[];
  for (const position of positions) {
    if (position.name === "player" && !prevSceneData.exitName) {
      player.setPosition(position.x, position.y);
      player.setControls();
      player.enablePassthrough();
      player.setEvents();
      player.respawnIfOutOfBounds(1000, "room001");
      continue;
    }

    if (position.name === "entrance-1" && prevSceneData.exitName === "exit-1") {
      player.setPosition(position.x, position.y);
      player.setControls();
      player.enablePassthrough();
      player.setEvents();
      player.respawnIfOutOfBounds(1000, "room001");
      engine.camPos(player.pos);
      continue;
    }

    if (position.name === "entrance-2" && prevSceneData.exitName === "exit-2") {
      player.setPosition(position.x, position.y);
      player.setControls();
      player.enablePassthrough();
      player.setEvents();
      player.respawnIfOutOfBounds(1000, "room001");
      engine.camPos(player.pos);
      continue;
    }

    if (position.type === "drone") {
      const drone = map.add<Enemy>(
        createDrone(engine, engine.vec2(position.x, position.y))
      );
      drone.setBehavior();
      drone.setEvents();
      continue;
    }

    if (position.name === "boss" && !state.current().isBossDefeated) {
      const boss = map.add<Boss>(createBoss(engine, engine.vec2(position.x, position.y)));
      boss.setBehavior();
      boss.setEvents();
    }

    if (position.type === "cartridge") {
      map.add(createCartridge(engine, engine.vec2(position.x, position.y)));
    }
  }

  const cameras = roomLayers[6].objects as TiledObject[];

  setCameraZones(engine, map, cameras);

  const exits = roomLayers[7].objects as TiledObject[];
  setExitZones(engine, map, exits, "room002");

  healthBar.setEvents();
  healthBar.trigger("update");
  engine.add(healthBar);
}
