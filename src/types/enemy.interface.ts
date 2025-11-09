import type { Vec2 } from "kaplay";
import type { EnemyEngineGameObj } from "./engine.type";
import type { FLYING_ENEMY_SPRITES } from "./sprites.enum";

export interface Enemy extends EnemyEngineGameObj {
  speed: number;
  range: number;
  patrolDistance: number;
  pursuitSpeed: number;
  maxPursuitDistance: number;
  initialPos: Vec2;
  isKnockedBack: boolean;
  behavior: FLYING_ENEMY_SPRITES;
}
