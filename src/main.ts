import { engine } from "./core/engine";
import { room001 } from "./scenes/room-001";
import { room002 } from "./scenes/room-002";
import type { TiledMap } from "./types/tiled-map";
import { setBackgroundColor } from "./utils/set-background-color";
import { createNotificationBox } from "./utils/create-notification-box";

async function main() {
  const room001TiledMap: TiledMap = await (
    await fetch("./assets/maps/room-001/config.json")
  ).json();

  const room002TiledMap: TiledMap = await (
    await fetch("./assets/maps/room-002/config.json")
  ).json();

  engine.scene("room001", (previousSceneData) => {
    room001(engine, room001TiledMap, previousSceneData);
  });
  engine.scene("room002", (previousSceneData) => {
    room002(engine, room002TiledMap, previousSceneData);
  });

  engine.scene("final-exit", () => {
    setBackgroundColor(engine, "#20214a");
    engine.add(
      createNotificationBox(
        engine,
        "You escaped the factory!\n The End. Thanks for playing!"
      )
    );
  });
}

engine.scene("intro", () => {
  setBackgroundColor(engine, "#20214a");
  engine.add(
    createNotificationBox(
      engine,
      "Escape the factory!\nUse arrow keys to move, x to jump, z to attack.\nPress Enter to start!"
    )
  );
  engine.onKeyPress("enter", () => {
    const context = new AudioContext();
    context.resume();
    engine.go("room001", { exitName: null });
  });
});

engine.go("intro");

main();
