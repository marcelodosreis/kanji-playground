import type { Engine } from "./engine.type";
import type { Player } from "./player.interface";
import type { Enemy } from "./enemy.interface";
import type { TiledMap } from "./tiled-map.interface";
import type { Map } from "./map.interface";
import type { Boss } from "./boss.interface";
import type { BossStateMachine } from "../core/system/enemies/boss/boss-state-machine";
import type { FlyingEnemyStateMachine } from "../core/system/enemies/flying-enemy/flying-enemy-state-machine";
import type { PlayerStateMachine } from "../core/system/player/player-state-machine";

export type SystemInitializer<T = any> = (context: T) => void;



export type PlayerSystemContext = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
  boundValue?: number;
  destinationName?: string;
  previousSceneData?: any;
  map: Map;
  tiledMap: TiledMap;
  initialCameraPos: { x: number; y: number };
  previousSceneExitName: string | null;
};
export type EnemySystemContext = {
  engine: Engine;
  enemy: Enemy;
  player: Player;
  stateMachine: FlyingEnemyStateMachine;
};

export type BossSystemContext = {
  engine: Engine;
  boss: Boss;
  player: Player;
  stateMachine: BossStateMachine;
};
