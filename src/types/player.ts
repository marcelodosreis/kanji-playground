import type { PlayerEngineGameObj, EngineEventCtrl } from "./engine";

export interface Player extends PlayerEngineGameObj {
  speed: number;
  isAttacking: boolean;
  controlHandlers: EngineEventCtrl[];
  setPosition(x: number, y: number): void;
  setControls(): void;
  setEvents(): void;
  enablePassthrough(): void;
  enableDoubleJump(): void;
  cleanupControls?(): void;
}
