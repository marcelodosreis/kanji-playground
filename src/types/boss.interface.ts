import type { BossEngineGameObj } from "./engine.interface";

export interface Boss extends BossEngineGameObj {
  pursuitSpeed: number;
  fireRange: number;
  fireDuration: number;
}
