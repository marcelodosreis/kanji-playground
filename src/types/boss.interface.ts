import type { BossEngineGameObj } from "./engine.type";

export interface Boss extends BossEngineGameObj {
  pursuitSpeed: number;
  fireRange: number;
  fireDuration: number;
  isKnockedBack: boolean;
}
