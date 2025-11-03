import { engine } from "./lib/engine";
import { room001 } from "./scenes/room-001";
import { room002 } from "./scenes/room-002";
import type { TiledMap } from "./types/tiledMap";

async function main() {
  const room001Map: TiledMap = await (
    await fetch("./src/scenes/room-001/map.json")
  ).json();
  
  const room002Map: TiledMap = await (
    await fetch("./src/scenes/room-002/map.json")
  ).json();

  console.log(room001Map)

  engine.scene("intro", () => null);
  engine.scene("room001", () => room001(engine, room001Map));
  engine.scene("room002", () => room002(engine, room002Map));

  engine.go("room001");
}

main();
