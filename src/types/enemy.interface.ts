import type { EnemyEngineGameObj } from "./engine.interface";
import type { Position } from "./position.interface";

export interface Enemy extends EnemyEngineGameObj {
  speed: number;
  range: number;
  pursuitSpeed: number;
  initialPos: Position;
}
