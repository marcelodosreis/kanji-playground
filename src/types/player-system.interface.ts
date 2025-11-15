import type { PlayerStateMachine } from "../systems/player/player-state-machine";
import type { Engine } from "./engine.type";
import type { Player } from "./player.interface";

export type BasePlayerSystemParams = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
};

export type PlayerSystemAPI = {
  update?: () => void;
  cleanup?: () => void;
};

export type PlayerSystemWithAPI<T> = PlayerSystemAPI & T;
