import { engine } from "./core/engine";
import { room001 } from "./scenes/room-001";
import { room002 } from "./scenes/room-002";
import type { TiledMap } from "./types/tiled-map";

async function main() {
  const room001TiledMap: TiledMap = await (
    await fetch("./assets/maps/room-001/config.json")
  ).json();

  engine.scene("intro", () => null);
  engine.scene("room001", () => room001(engine, room001TiledMap));
  engine.scene("room002", () => room002());

  engine.go("room001");
}

main();
