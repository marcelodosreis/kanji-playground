import type { Engine } from "./engine.type";
import type { Player } from "./player.interface";
import type { Enemy } from "./enemy.interface";
import type { TiledMap } from "./tiled-map.interface";
import type { Map } from "./map.interface";

export type SystemInitializer<T = any> = (context: T) => void;



export type PlayerSystemContext = {
  engine: Engine;
  player: Player;
  stateMachine: any;
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
  stateMachine: any;
};
