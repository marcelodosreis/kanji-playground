import type { PlayerEngineGameObj, EngineEventCtrl } from "./engine.interface";

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
  respawnIfOutOfBounds(
    boundValue: number,
    destinationName: string,
    previousSceneData?: { exitName: string | null }
  ): void;
}
