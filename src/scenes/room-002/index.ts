import { createCartridge } from "../../entities/cartridge";
import { createPlayer } from "../../entities/player";
import type { Engine, EngineGameObj } from "../../types/engine";
import type { Player } from "../../types/player";
import type { TiledMap, TiledObject } from "../../types/tiled-map";
import { healthBar } from "../../utils/create-health-bar";
import { setBackgroundColor } from "../../utils/set-background-color";
import { setCameraControl } from "../../utils/set-camera-control";
import { setCameraZones } from "../../utils/set-camera-zones";
import { setExitZones } from "../../utils/set-exit-zones";
import { setMapCollider } from "../../utils/set-map-collider";

export function room002(
  engine: Engine,
  tiledMap: TiledMap,
  prevSceneData: EngineGameObj
) {
  setBackgroundColor(engine, "#a2aed5");

  engine.camScale(2);
  engine.camPos(170, 100);
  engine.setGravity(1000);

  const roomLayers = tiledMap.layers;
  const map = engine.add([engine.pos(0, 0), engine.sprite("room002")]);

  const colliders = roomLayers[4].objects as TiledObject[];
  setMapCollider(engine, map, colliders);

  const player = engine.add<Player>(createPlayer(engine));

  setCameraControl(engine, map, player, tiledMap);

  const positions = roomLayers[5].objects as TiledObject[];
  for (const position of positions) {
    if (position.name === "entrance-1" && prevSceneData.exitName === "exit-1") {
      player.setPosition(position.x + map.pos.x, position.y + map.pos.y);
      player.setControls();
      player.enablePassthrough();
      player.setEvents();
      continue;
    }

    if (position.name === "entrance-2" && prevSceneData.exitName === "exit-2") {
      player.setPosition(position.x + map.pos.x, position.y + map.pos.y);
      player.setControls();
      player.enablePassthrough();
      player.setEvents();
      player.respawnIfOutOfBounds(1000, "room002", { exitName: "exit-2" });
      engine.camPos(player.pos);
      continue;
    }

    if (position.type === "cartridge") {
      map.add(createCartridge(engine, engine.vec2(position.x, position.y)));
    }
  }

  const cameras = roomLayers[6].objects as TiledObject[];

  setCameraZones(engine, map, cameras);

  const exits = roomLayers[7].objects as TiledObject[];
  setExitZones(engine, map, exits, "room001");

  healthBar.setEvents();
  healthBar.trigger("update");
  engine.add(healthBar);
}
