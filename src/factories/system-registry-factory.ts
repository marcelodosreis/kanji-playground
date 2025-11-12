import { FlyingEnemyMovementSystem } from "../core/system/enemies/flying-enemy/flying-enemy-movement";
import { FlyingEnemyDetectionSystem } from "../core/system/enemies/flying-enemy/flying-enemy-detection";
import { FlyingEnemyPatrolDirectionSystem } from "../core/system/enemies/flying-enemy/fly-enemy-patrol-system/flying-enemy-patrol-direction";
import { FlyingEnemyPatrolHeightSystem } from "../core/system/enemies/flying-enemy/fly-enemy-patrol-system/flying-enemy-patrol-height.system";

import { FlyingEnemyPatrolSystem } from "../core/system/enemies/flying-enemy/fly-enemy-patrol-system/flying-enemy-patrol.system";
import { FlyingEnemyAlertSystem } from "../core/system/enemies/flying-enemy/flying-enemy-alert.system";
import { FlyingEnemyAttackSystem } from "../core/system/enemies/flying-enemy/flying-enemy-attack.system";
import { FlyingEnemyReturnSystem } from "../core/system/enemies/flying-enemy/flying-enemy-return.system";
import { FlyingEnemyUnstuckSystem } from "../core/system/enemies/flying-enemy/flying-enemy-unstuck.system";
import { FlyingEnemyCollisionSystem } from "../core/system/enemies/flying-enemy/flying-enemy-collision.system";
import { FlyingEnemyAnimationSystem } from "../core/system/enemies/flying-enemy/flying-enemy-animation.system";

import { BossAnimationSystem } from "../core/system/enemies/boss/boss-animation.system";
import { BossAttackSystem } from "../core/system/enemies/boss/boss-attack.system";
import { BossCollisionSystem } from "../core/system/enemies/boss/boss-colision.system";

import { PlayerAnimationSystem } from "../core/system/player/player-animation.system";
import { PlayerAttackSystem } from "../core/system/player/player-attack.system";
import { PlayerBoundarySystem } from "../core/system/player/player-boundary.system";
import { PlayerCameraSystem } from "../core/system/player/player-camera.system";
import { PlayerHealthSystem } from "../core/system/player/player-health.system";
import { PlayerRespawnSystem } from "../core/system/player/player-respawn.system";
import { PlayerJumpSystem } from "../core/system/player/player-jump-system/player-jump.system";
import { PlayerPassthroughSystem } from "../core/system/player/player-passthrough.system";
import { PlayerWalkSystem } from "../core/system/player/player-walk.system";
import { PlayerOrientationSystem } from "../core/system/player/player-orientation.system";

import type {
  PlayerSystemContext,
  EnemySystemContext,
  BossSystemContext,
} from "../types/system.types";

export class SystemRegistryFactory {
  static registerPlayerSystems(context: PlayerSystemContext): void {
    if (!context.boundValue) return;

    const orientationSystem = PlayerOrientationSystem({
      engine: context.engine,
      player: context.player,
      stateMachine: context.stateMachine,
    });

    PlayerJumpSystem({
      engine: context.engine,
      player: context.player,
      stateMachine: context.stateMachine,
    });

    PlayerWalkSystem({
      engine: context.engine,
      player: context.player,
      stateMachine: context.stateMachine,
      orientationSystem,
    });

    PlayerAttackSystem({
      engine: context.engine,
      player: context.player,
      stateMachine: context.stateMachine,
      orientationSystem,
    });

    PlayerBoundarySystem({
      engine: context.engine,
      player: context.player,
      boundValue: context.boundValue,
    });

    PlayerHealthSystem({
      engine: context.engine,
      player: context.player,
      stateMachine: context.stateMachine,
    });

    PlayerRespawnSystem({
      engine: context.engine,
      player: context.player,
      destinationName: context.destinationName!,
      previousSceneData: context.previousSceneData!,
    });

    PlayerAnimationSystem({
      engine: context.engine,
      player: context.player,
      stateMachine: context.stateMachine,
    });

    PlayerPassthroughSystem({ player: context.player });

    PlayerCameraSystem({
      engine: context.engine,
      map: context.map,
      tiledMap: context.tiledMap,
      player: context.player,
      initialCameraPos: context.initialCameraPos,
      previousSceneData: context.previousSceneData,
    });
  }

  static registerFlyingEnemySystems(context: EnemySystemContext): void {
    const movement = FlyingEnemyMovementSystem({
      engine: context.engine,
      enemy: context.enemy,
    });

    const detection = FlyingEnemyDetectionSystem({
      enemy: context.enemy,
      player: context.player,
      colliders: context.colliders,
    });

    const patrolDirection = FlyingEnemyPatrolDirectionSystem({
      enemy: context.enemy,
      stateMachine: context.stateMachine,
    });

    FlyingEnemyPatrolHeightSystem({
      engine: context.engine,
      enemy: context.enemy,
      stateMachine: context.stateMachine,
      movement,
    });

    FlyingEnemyPatrolSystem({
      engine: context.engine,
      enemy: context.enemy,
      stateMachine: context.stateMachine,
      movement,
      detection,
      patrolDirection,
    });

    FlyingEnemyAlertSystem({
      engine: context.engine,
      enemy: context.enemy,
      player: context.player,
      stateMachine: context.stateMachine,
      movement,
      detection,
    });

    FlyingEnemyAttackSystem({
      engine: context.engine,
      enemy: context.enemy,
      player: context.player,
      stateMachine: context.stateMachine,
      movement,
      detection,
    });

    FlyingEnemyReturnSystem({
      engine: context.engine,
      enemy: context.enemy,
      stateMachine: context.stateMachine,
      movement,
      detection,
    });

    FlyingEnemyUnstuckSystem({
      engine: context.engine,
      enemy: context.enemy,
      detection,
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

  static registerBossSystems(context: BossSystemContext): void {
    BossAttackSystem({
      engine: context.engine,
      boss: context.boss,
      player: context.player,
      stateMachine: context.stateMachine,
    });

    BossAnimationSystem({
      engine: context.engine,
      boss: context.boss,
      stateMachine: context.stateMachine,
    });

    BossCollisionSystem({
      engine: context.engine,
      boss: context.boss,
      player: context.player,
    });
  }
}
