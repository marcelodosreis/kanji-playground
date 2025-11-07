import type {
  PlayerEngineGameObj,
  EngineEventCtrl,
  EngineGameObj,
} from "./engine.interface";

export interface Player extends PlayerEngineGameObj {
  speed: number;
  isAttacking: boolean;
  controlHandlers: EngineEventCtrl[];
  isKnockedBack: boolean;
  hurt: (amount: number, source?: EngineGameObj) => void;
}
