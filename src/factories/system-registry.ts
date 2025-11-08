import { FlyingEnemyAlertSystem } from "../core/system/enemies/flying-enemy/flying-enemy-alert.system";
import { FlyingEnemyAnimationSystem } from "../core/system/enemies/flying-enemy/flying-enemy-animation.system";
import { FlyingEnemyAttackSystem } from "../core/system/enemies/flying-enemy/flying-enemy-attack.system";
import { FlyingEnemyCollisionSystem } from "../core/system/enemies/flying-enemy/flying-enemy-collision.system";
import { FlyingEnemyPatrolSystem } from "../core/system/enemies/flying-enemy/flying-enemy-patrol.system";
import { FlyingEnemyReturnSystem } from "../core/system/enemies/flying-enemy/flying-enemy-return.system";
import { PlayerAnimationSystem } from "../core/system/player/player-animation.system";
import { PlayerAttackSystem } from "../core/system/player/player-attack.system";
import { PlayerBoundarySystem } from "../core/system/player/player-boundary.system";
import { PlayerHealthSystem } from "../core/system/player/player-health.system";
import { PlayerJumpSystem } from "../core/system/player/player-jump.system";
import { PlayerPassthroughSystem } from "../core/system/player/player-passthrough.system";
import { PlayerWalkSystem } from "../core/system/player/player-walk.system";
import type {
  PlayerSystemContext,
  EnemySystemContext,
} from "../types/system.types";

export class SystemRegistry {
  static registerPlayerSystems(context: PlayerSystemContext): void {
    if (!context.boundValue) return;
    
    PlayerJumpSystem({
      engine: context.engine,
      player: context.player,
      stateMachine: context.stateMachine,
    });
    PlayerWalkSystem({
      engine: context.engine,
      player: context.player,
      stateMachine: context.stateMachine,
    });
    PlayerAttackSystem({
      engine: context.engine,
      player: context.player,
      stateMachine: context.stateMachine,
    });
    PlayerBoundarySystem({
      engine: context.engine,
      player: context.player,
      boundValue: context.boundValue,
    });
    PlayerHealthSystem({
      engine: context.engine,
      player: context.player,
      destinationName: context.destinationName!,
      previousSceneData: context.previousSceneData!,
      stateMachine: context.stateMachine,
    });
    PlayerAnimationSystem({
      engine: context.engine,
      player: context.player,
      stateMachine: context.stateMachine,
    });
    PlayerPassthroughSystem({ player: context.player });
  }

  static registerFlyingEnemySystems(context: EnemySystemContext): void {
    FlyingEnemyPatrolSystem({
      engine: context.engine,
      enemy: context.enemy,
      player: context.player,
      stateMachine: context.stateMachine,
    });
    FlyingEnemyAlertSystem({
      engine: context.engine,
      enemy: context.enemy,
      player: context.player,
      stateMachine: context.stateMachine,
    });
    FlyingEnemyAttackSystem({
      engine: context.engine,
      enemy: context.enemy,
      player: context.player,
      stateMachine: context.stateMachine,
    });
    FlyingEnemyReturnSystem({
      engine: context.engine,
      enemy: context.enemy,
      player: context.player,
      stateMachine: context.stateMachine,
    });
    FlyingEnemyCollisionSystem({
      engine: context.engine,
      enemy: context.enemy,
      player: context.player,
    });
    FlyingEnemyAnimationSystem({
      engine: context.engine,
      enemy: context.enemy,
    });
  }
}
