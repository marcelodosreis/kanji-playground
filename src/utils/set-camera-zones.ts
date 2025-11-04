import type { Engine } from "../types/engine";
import type { Map } from "../types/map";
import type { TiledObject } from "../types/tiled-map";

export function setCameraZones(
  engine: Engine,
  map: Map,
  cameras: TiledObject[]
) {
  for (const camera of cameras) {
    const cameraZone = map.add([
      engine.area({
        shape: new engine.Rect(engine.vec2(0), camera.width, camera.height),
        collisionIgnore: ["collider"],
      }),
      engine.pos(camera.x, camera.y),
    ]);

    cameraZone.onCollide("player", () => {
      if (engine.camPos().x !== camera.properties[0].value) {
        engine.tween(
          engine.camPos().y,
          camera.properties[0].value,
          0.8,
          (val) => engine.camPos(engine.camPos().x, val),
          engine.easings.linear
        );
      }
    });
  }
}
