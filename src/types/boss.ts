import type { BossEngineGameObj } from "./engine";

export interface Boss extends BossEngineGameObj {
  pursuitSpeed: number;
  fireRange: number;
  fireDuration: number;
  enterState(state: string): void;
  setEvents(): void;
  setBehavior(): void;
}
