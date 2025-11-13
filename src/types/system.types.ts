import type { CollidersEngineGameObj, Engine } from "./engine.type";
import type { Player } from "./player.interface";
import type { Enemy } from "./enemy.interface";
import type { TiledMap } from "./tiled-map.interface";
import type { Map } from "./map.interface";
import type { Boss } from "./boss.interface";
import type { BossStateMachine } from "../systems/enemies/boss/boss-state-machine";
import type { FlyingEnemyStateMachine } from "../systems/enemies/flying-enemy/fly-enemy-state-machine-system";
import type { PlayerStateMachine } from "../systems/player/player-state-machine";
import type { SCENE_DATA } from "./scenes.enum";

export type SystemInitializer<T = any> = (context: T) => void;

export type PlayerSystemContext = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
  boundValue?: number;
  destinationName?: string;
  previousSceneData?: SCENE_DATA;
  map: Map;
  tiledMap: TiledMap;
  initialCameraPos: { x: number; y: number };
};
export type EnemySystemContext = {
  engine: Engine;
  enemy: Enemy;
  player: Player;
  colliders: CollidersEngineGameObj[];
  stateMachine: FlyingEnemyStateMachine;
};

export type BossSystemContext = {
  engine: Engine;
  boss: Boss;
  player: Player;
  stateMachine: BossStateMachine;
};
