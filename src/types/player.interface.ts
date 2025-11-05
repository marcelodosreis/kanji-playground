import type { PlayerEngineGameObj, EngineEventCtrl } from "./engine.interface";

export interface Player extends PlayerEngineGameObj {
  speed: number;
  isAttacking: boolean;
  controlHandlers: EngineEventCtrl[];
}
