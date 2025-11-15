import { spawnHitConfirm } from "../../../helpers/hit-confirm.helper";
import { createTransientHitbox } from "../../../helpers/hitbox.helper";
import { PLAYER_ANIMATIONS } from "../../../types/animations.enum";
import type { Engine, EngineGameObj } from "../../../types/engine.type";
import type { Player } from "../../../types/player.interface";
import { EXTRA_TAGS, HITBOX_TAGS } from "../../../types/tags.enum";
import { applyKnockback } from "../../../utils/apply-knockback";
import { isPaused } from "../../../utils/is-paused";
import { type PlayerStateMachine } from "../player-state-machine";

interface PlayerAttackSystemDependencies {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
  orientationSystem: OrientationSystem;
}

interface OrientationSystem {
  lockOrientation: () => void;
  unlockOrientation: () => void;
}

interface HitboxConfiguration {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

interface AttackSystemState {
  destroyActiveHitbox: (() => void) | null;
  lastProcessedAnimationFrame: number;
}

interface HitConfirmSpawnPosition {
  x: number;
  y: number;
}

const ATTACK_INPUT_KEY = "z";
const HITBOX_SPAWN_FRAME = 1;
const HITBOX_DESTROY_FRAME = 5;
const HITBOX_WIDTH = 32;
const HITBOX_HEIGHT = 16;
const HITBOX_VERTICAL_OFFSET = -8;
const PLAYER_RECOIL_STRENGTH = 0.2;
const HIT_CONFIRM_SCALE = 1.4;
const HIT_CONFIRM_HORIZONTAL_OFFSET = 12;
const FACING_LEFT_ROTATION = 0;
const FACING_RIGHT_ROTATION = 180;

export function PlayerAttackSystem({
  engine,
  player,
  stateMachine,
  orientationSystem,
}: PlayerAttackSystemDependencies): void {
  initializeControlHandlers(player);

  const attackState = createInitialAttackState();

  const hitboxManager = createHitboxManager(engine, player, attackState);

  const attackController = createAttackController(
    stateMachine,
    orientationSystem,
    hitboxManager
  );

  registerEventHandlers(
    engine,
    player,
    hitboxManager,
    attackController
  );
}

function initializeControlHandlers(player: Player): void {
  player.controlHandlers = player.controlHandlers || [];
}

function createInitialAttackState(): AttackSystemState {
  return {
    destroyActiveHitbox: null,
    lastProcessedAnimationFrame: -1,
  };
}

function createHitboxManager(
  engine: Engine,
  player: Player,
  state: AttackSystemState
) {
  return {
    spawnSwordHitbox(): void {
      const hitboxConfig = calculateHitboxConfiguration(player.flipX);
      const hitboxDestructor = spawnPlayerSwordHitbox(
        engine,
        player,
        hitboxConfig
      );
      state.destroyActiveHitbox = hitboxDestructor;
    },

    destroySwordHitbox(): void {
      if (state.destroyActiveHitbox !== null) {
        state.destroyActiveHitbox();
        state.destroyActiveHitbox = null;
      }
    },

    resetState(): void {
      this.destroySwordHitbox();
      state.lastProcessedAnimationFrame = -1;
    },

    processAnimationFrame(): void {
      if (!isPlayerPerformingAttack(player)) {
        return;
      }

      const currentAnimationFrame = player.animFrame;

      if (currentAnimationFrame === state.lastProcessedAnimationFrame) {
        return;
      }

      state.lastProcessedAnimationFrame = currentAnimationFrame;
      this.updateHitboxBasedOnFrame(currentAnimationFrame);
      applyAttackRecoilToPlayer(engine, player);
    },

    updateHitboxBasedOnFrame(currentFrame: number): void {
      const hasActiveHitbox = state.destroyActiveHitbox !== null;

      if (shouldSpawnHitbox(currentFrame, hasActiveHitbox)) {
        this.spawnSwordHitbox();
      }

      if (shouldDestroyHitbox(currentFrame, hasActiveHitbox)) {
        this.destroySwordHitbox();
      }
    },
  };
}

function createAttackController(
  stateMachine: PlayerStateMachine,
  orientationSystem: OrientationSystem,
  hitboxManager: ReturnType<typeof createHitboxManager>
) {
  return {
    async handleAttackInput(pressedKey: string): Promise<void> {
      if (!canInitiateAttack(pressedKey, stateMachine)) {
        return;
      }

      orientationSystem.lockOrientation();
      stateMachine.dispatch("ATTACK");
      hitboxManager.resetState();
    },

    handleAttackAnimationComplete(completedAnimation: string): void {
      if (!isAttackAnimation(completedAnimation)) {
        return;
      }

      hitboxManager.resetState();
      orientationSystem.unlockOrientation();

      if (isPlayerStillInAttackState(stateMachine)) {
        stateMachine.dispatch("IDLE");
      }
    },
  };
}

function registerEventHandlers(
  engine: Engine,
  player: Player,
  hitboxManager: ReturnType<typeof createHitboxManager>,
  attackController: ReturnType<typeof createAttackController>
): void {
  const keyPressHandler = engine.onKeyPress(
    attackController.handleAttackInput.bind(attackController)
  );

  player.controlHandlers.push(keyPressHandler);

  player.onAnimEnd(
    attackController.handleAttackAnimationComplete.bind(attackController)
  );

  engine.onUpdate(() => hitboxManager.processAnimationFrame());
}

function calculateHitboxConfiguration(
  isPlayerFacingLeft: boolean
): HitboxConfiguration {
  const horizontalOffset = isPlayerFacingLeft ? -HITBOX_WIDTH : 0;

  return {
    width: HITBOX_WIDTH,
    height: HITBOX_HEIGHT,
    offsetX: horizontalOffset,
    offsetY: HITBOX_VERTICAL_OFFSET,
  };
}

function spawnPlayerSwordHitbox(
  engine: Engine,
  player: Player,
  config: HitboxConfiguration
): () => void {
  const { destroy: destroyHitbox } = createTransientHitbox({
    engine,
    owner: player,
    width: config.width,
    height: config.height,
    offsetX: config.offsetX,
    offsetY: config.offsetY,
    tag: HITBOX_TAGS.PLAYER_SWORD,
    collideWithTag: EXTRA_TAGS.HITTABLE,
    onCollide: (targetEntity) => {
      const hitConfirmPosition = calculateHitConfirmPosition(
        player,
        targetEntity
      );
      const hitConfirmRotation = calculateHitConfirmRotation(
        player,
        targetEntity
      );

      spawnHitConfirm({
        engine,
        position: hitConfirmPosition,
        scale: HIT_CONFIRM_SCALE,
        rotation: hitConfirmRotation,
      });
    },
  });

  return destroyHitbox;
}

function calculateHitConfirmPosition(
  player: Player,
  target: EngineGameObj
): HitConfirmSpawnPosition {
  const isTargetOnLeft = target.pos.x < player.pos.x;
  const horizontalOffset = isTargetOnLeft
    ? -HIT_CONFIRM_HORIZONTAL_OFFSET
    : HIT_CONFIRM_HORIZONTAL_OFFSET;

  return {
    x: target.pos.x + horizontalOffset,
    y: target.pos.y,
  };
}

function calculateHitConfirmRotation(
  player: Player,
  target: EngineGameObj
): number {
  const isTargetOnLeft = target.pos.x < player.pos.x;
  return isTargetOnLeft ? FACING_LEFT_ROTATION : FACING_RIGHT_ROTATION;
}

function applyAttackRecoilToPlayer(engine: Engine, player: Player): void {
  const recoilDirection = player.flipX ? 1 : -1;
  const recoilSourcePosition = {
    pos: {
      x: player.pos.x - recoilDirection,
    },
  };

  applyKnockback({
    engine,
    target: player,
    source: recoilSourcePosition as unknown as EngineGameObj,
    strength: PLAYER_RECOIL_STRENGTH,
  });
}

function shouldSpawnHitbox(
  currentFrame: number,
  hasActiveHitbox: boolean
): boolean {
  return currentFrame === HITBOX_SPAWN_FRAME && !hasActiveHitbox;
}

function shouldDestroyHitbox(
  currentFrame: number,
  hasActiveHitbox: boolean
): boolean {
  return currentFrame === HITBOX_DESTROY_FRAME && hasActiveHitbox;
}

function isAttackAnimation(animationName: string): boolean {
  return animationName === PLAYER_ANIMATIONS.ATTACK;
}

function isPlayerPerformingAttack(player: Player): boolean {
  return isAttackAnimation(player.curAnim() as PLAYER_ANIMATIONS);
}

function canInitiateAttack(
  pressedKey: string,
  stateMachine: PlayerStateMachine
): boolean {
  return (
    !isPaused() &&
    pressedKey === ATTACK_INPUT_KEY &&
    !stateMachine.isAttacking()
  );
}

function isPlayerStillInAttackState(stateMachine: PlayerStateMachine): boolean {
  return stateMachine.getState() === PLAYER_ANIMATIONS.ATTACK;
}
