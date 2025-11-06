import type { Enemy } from "../../types/enemy.interface";

type Params = { drone: Enemy };

export function DronePositionResetSystem({ drone }: Params) {
  function onExitScreen() {
    if (drone.pos.dist(drone.initialPos) > 400) {
      drone.pos = drone.initialPos;
    }
  }

  drone.onExitScreen(onExitScreen);
}
