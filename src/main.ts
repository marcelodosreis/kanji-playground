import { engine } from "./core/engine";
import { room001 } from "./scenes/room-001/room-001";
import { room002 } from "./scenes/room-002/room-002";
import type { TiledMap } from "./types/tiledMap";

async function main() {
  const room001TiledMap: TiledMap = await (
    await fetch("./src/scenes/room-001/room-001-map.json")
  ).json();
  
  const room002TiledMap: TiledMap = await (
    await fetch("./src/scenes/room-002/room-002-map.json")
  ).json();

  console.log(room001TiledMap)

  engine.scene("intro", () => null);
  engine.scene("room001", () => room001(engine, room001TiledMap));
  engine.scene("room002", () => room002(engine, room002TiledMap));

  engine.go("room001");
}

main();
