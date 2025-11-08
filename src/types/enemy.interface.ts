import type { Vec2 } from "kaplay";
import type { EnemyEngineGameObj } from "./engine.type";

export interface Enemy extends EnemyEngineGameObj {
  speed: number;
  range: number;
  pursuitSpeed: number;
  maxPursuitDistance: number;
  initialPos: Vec2;
  isKnockedBack: boolean;
}