import type {
  PlayerEngineGameObj,
  EngineEventCtrl,
  EngineGameObj,
} from "./engine.interface";

export interface Player extends PlayerEngineGameObj {
  speed: number;
  controlHandlers: EngineEventCtrl[];
  hurt: (amount: number, source?: EngineGameObj) => void;
}
