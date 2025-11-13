import { FlyingEnemyMovementSystem } from "../systems/enemies/flying-enemy/flying-enemy-movement";
import { FlyingEnemyDetectionSystem } from "../systems/enemies/flying-enemy/flying-enemy-detection";
import { FlyingEnemyPatrolDirectionSystem } from "../systems/enemies/flying-enemy/fly-enemy-patrol-system/flying-enemy-patrol-direction";
import { FlyingEnemyPatrolHeightSystem } from "../systems/enemies/flying-enemy/fly-enemy-patrol-system/flying-enemy-patrol-height.system";

import { FlyingEnemyPatrolSystem } from "../systems/enemies/flying-enemy/fly-enemy-patrol-system/flying-enemy-patrol.system";
import { FlyingEnemyAlertSystem } from "../systems/enemies/flying-enemy/flying-enemy-alert.system";
import { FlyingEnemyAttackSystem } from "../systems/enemies/flying-enemy/flying-enemy-attack.system";
import { FlyingEnemyReturnSystem } from "../systems/enemies/flying-enemy/flying-enemy-return.system";
import { FlyingEnemyUnstuckSystem } from "../systems/enemies/flying-enemy/flying-enemy-unstuck.system";
import { FlyingEnemyCollisionSystem } from "../systems/enemies/flying-enemy/flying-enemy-collision.system";
import { FlyingEnemyAnimationSystem } from "../systems/enemies/flying-enemy/flying-enemy-animation.system";

import { BossAnimationSystem } from "../systems/enemies/boss/boss-animation.system";
import { BossAttackSystem } from "../systems/enemies/boss/boss-attack.system";
import { BossCollisionSystem } from "../systems/enemies/boss/boss-colision.system";

import { PlayerAnimationSystem } from "../systems/player/player-animation.system";
import { PlayerAttackSystem } from "../systems/player/player-attack.system";
import { PlayerBoundarySystem } from "../systems/player/player-boundary.system";
import { PlayerCameraSystem } from "../systems/player/player-camera.system";
import { PlayerHealthSystem } from "../systems/player/player-health.system";
import { PlayerRespawnSystem } from "../systems/player/player-respawn.system";
import { PlayerJumpSystem } from "../systems/player/player-jump-system/player-jump.system";
import { PlayerPassthroughSystem } from "../systems/player/player-passthrough.system";
import { PlayerWalkSystem } from "../systems/player/player-walk.system";
import { PlayerOrientationSystem } from "../systems/player/player-orientation.system";

import type {
  PlayerSystemContext,
  EnemySystemContext,
  BossSystemContext,
} from "../types/system.types";
import { FlyingEnemyIdleSystem } from "../systems/enemies/flying-enemy/flying-enemy-idle.system";

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

    FlyingEnemyIdleSystem({
      engine: context.engine,
      enemy: context.enemy,
      stateMachine: context.stateMachine,
      movement,
      detection,
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
      colliders: context.colliders,
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
      stateMachine: context.stateMachine,
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
