import type { EngineGameObj, EngineEventCtrl } from "./engine";

export interface Player extends EngineGameObj {
  speed: number;
  isAttacking: boolean;
  controlHandlers: EngineEventCtrl[];
  setPosition(x: number, y: number): void;
  setControls(): void;
  setEvents(): void;
  enablePassthrough(): void;
  cleanupControls?(): void;
}
