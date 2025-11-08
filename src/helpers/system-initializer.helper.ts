import type { Engine } from "../types/engine.type";
import type { Player } from "../types/player.interface";
import type { Enemy } from "../types/enemy.interface";
import { SystemRegistry } from "../factories/system-registry";
import { createPlayerStateMachine } from "../core/system/player/player-state-machine";
import { createFlyingEnemyStateMachine } from "../core/system/enemies/flying-enemy/flying-enemy-state-machine";

type PlayerInitOpts = {
  boundValue?: number;
  destinationName?: string;
  previousSceneData?: any;
};

export class SystemInitializerHelper {
  static initPlayerSystems(
    engine: Engine,
    player: Player,
    opts?: PlayerInitOpts
  ): void {
    const stateMachine = createPlayerStateMachine({ player });
    SystemRegistry.registerPlayerSystems({
      engine,
      player,
      stateMachine,
      boundValue: opts?.boundValue,
      destinationName: opts?.destinationName,
      previousSceneData: opts?.previousSceneData,
    });
  }

  static initFlyingEnemySystems(
    engine: Engine,
    enemy: Enemy,
    player: Player
  ): void {
    const stateMachine = createFlyingEnemyStateMachine({
      engine,
      enemy,
      player,
    });
    SystemRegistry.registerFlyingEnemySystems({
      engine,
      enemy,
      player,
      stateMachine,
    });
  }
}
