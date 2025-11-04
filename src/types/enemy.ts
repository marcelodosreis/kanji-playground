import type { EnemyEngineGameObj } from "./engine";

export interface Enemy extends EnemyEngineGameObj {
  speed: number;
  range: number;
  pursuitSpeed: number;
  enterState(state: string): void;
  setEvents(): void;
  setBehavior(): void;
}
