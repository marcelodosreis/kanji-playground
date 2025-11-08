/**
 * Flying Enemy AI State Machine
 *
 * States:
 * - PATROL_RIGHT <-> PATROL_LEFT (patrolling)
 * - PATROL_* -> ALERT (player in range)
 * - ALERT -> ATTACK (player in range) | RETURN (player not in range)
 * - ATTACK -> RETURN (player out of range or pursuit limit)
 * - RETURN -> PATROL_RIGHT (at initial pos) | ALERT (player in range)
 *
 * All transitions are event-driven and pause-aware.
 */
import type { Engine } from "../../types/engine.interface";
import type { Enemy } from "../../types/enemy.interface";
import type { Player } from "../../types/player.interface";
import { ENGINE_DEFAULT_EVENTS, FLYING_ENEMY_EVENTS } from "../../types/events.enum";
import { HITBOX_TAGS, TAGS } from "../../types/tags.enum";
import {
  isPaused,
  wrapWithPauseCheck,
} from "../../utils/wrap-with-pause-check";
import { GLOBAL_STATE_CONTROLLER } from "../global-state-controller";
import { GLOBAL_STATE } from "../../types/state.interface";
import { BAT_ANIMATIONS } from "../../types/animations.enum";
import { StateMachine, type StateMachineConfig } from "../state-machine";
import { applyKnockback } from "../../utils/apply-knockback";


type FlyingEnemyContext = {
  engine: Engine;
  enemy: Enemy;
  player: Player;
  stateMachine: FlyingEnemyStateMachine;
};

type FlyingEnemyState = FLYING_ENEMY_EVENTS;

const RETURN_THRESHOLD = 20;
const POSITION_RESET_DISTANCE = 400;

const StatePredicates = {
  isPlayerInRange: (ctx: FlyingEnemyContext): boolean =>
    ctx.enemy.pos.dist(ctx.player.pos) < ctx.enemy.range,

  isAtInitialPosition: (ctx: FlyingEnemyContext): boolean =>
    ctx.enemy.pos.dist(ctx.enemy.initialPos) < RETURN_THRESHOLD,

  isBeyondPursuitLimit: (ctx: FlyingEnemyContext): boolean =>
    ctx.enemy.pos.dist(ctx.enemy.initialPos) > ctx.enemy.maxPursuitDistance,

  canReachPlayer: (ctx: FlyingEnemyContext): boolean => {
    const distanceToPlayer = ctx.enemy.pos.dist(ctx.player.pos);
    const distancePlayerFromInitial = ctx.player.pos.dist(
      ctx.enemy.initialPos
    );
    return (
      distancePlayerFromInitial <= ctx.enemy.maxPursuitDistance &&
      distanceToPlayer < ctx.enemy.range
    );
  },

  isAlive: (ctx: FlyingEnemyContext): boolean => ctx.enemy.hp() > 0,

  canMove: (ctx: FlyingEnemyContext): boolean =>
    ctx.enemy.hp() > 0 && !ctx.enemy.isKnockedBack,
};

function wrapWithPauseCheckCtx<T>(
  callback: (ctx: T) => void | Promise<void>
): (ctx: T) => void | Promise<void> {
  return (ctx: T) => wrapWithPauseCheck(() => callback(ctx))();
}

const createStateHandlers = () => ({
  [FLYING_ENEMY_EVENTS.PATROL_RIGHT]: {
    onEnter: async (ctx: FlyingEnemyContext): Promise<void> => {
      if (!ctx.enemy.curAnim()) ctx.enemy.play(BAT_ANIMATIONS.FLYING);
      await ctx.engine.wait(3);

      if (
        ctx.enemy.state === FLYING_ENEMY_EVENTS.PATROL_RIGHT &&
        StatePredicates.isAlive(ctx) &&
        !isPaused()
      ) {
        ctx.stateMachine.dispatch(FLYING_ENEMY_EVENTS.PATROL_LEFT);
      }
    },

    onUpdate: (ctx: FlyingEnemyContext): void => {
      if (!StatePredicates.isAlive(ctx)) return;

      if (StatePredicates.isPlayerInRange(ctx)) {
        ctx.stateMachine.dispatch(FLYING_ENEMY_EVENTS.ALERT);
        return;
      }

      ctx.enemy.flipX = false;
      ctx.enemy.move(ctx.enemy.speed, 0);
    },
  },

  [FLYING_ENEMY_EVENTS.PATROL_LEFT]: {
    onEnter: async (ctx: FlyingEnemyContext): Promise<void> => {
      if (!ctx.enemy.curAnim()) ctx.enemy.play(BAT_ANIMATIONS.FLYING);
      await ctx.engine.wait(3);

      if (
        ctx.enemy.state === FLYING_ENEMY_EVENTS.PATROL_LEFT &&
        StatePredicates.isAlive(ctx) &&
        !isPaused()
      ) {
        ctx.stateMachine.dispatch(FLYING_ENEMY_EVENTS.PATROL_RIGHT);
      }
    },

    onUpdate: (ctx: FlyingEnemyContext): void => {
      if (!StatePredicates.isAlive(ctx)) return;

      if (StatePredicates.isPlayerInRange(ctx)) {
        ctx.stateMachine.dispatch(FLYING_ENEMY_EVENTS.ALERT);
        return;
      }

      ctx.enemy.flipX = true;
      ctx.enemy.move(-ctx.enemy.speed, 0);
    },
  },

  [FLYING_ENEMY_EVENTS.ALERT]: {
    onEnter: async (ctx: FlyingEnemyContext): Promise<void> => {
      if (!ctx.enemy.curAnim()) ctx.enemy.play(BAT_ANIMATIONS.FLYING);
      await ctx.engine.wait(0.5);

      if (!StatePredicates.isAlive(ctx) || isPaused()) return;

      if (StatePredicates.isPlayerInRange(ctx)) {
        ctx.stateMachine.dispatch(FLYING_ENEMY_EVENTS.ATTACK);
      } else {
        ctx.stateMachine.dispatch(FLYING_ENEMY_EVENTS.RETURN);
      }
    },
  },

  [FLYING_ENEMY_EVENTS.ATTACK]: {
    onUpdate: (ctx: FlyingEnemyContext): void => {
      if (!ctx.enemy.curAnim()) ctx.enemy.play(BAT_ANIMATIONS.FLYING);

      if (!StatePredicates.canMove(ctx)) return;

      if (
        StatePredicates.isBeyondPursuitLimit(ctx) ||
        !StatePredicates.isPlayerInRange(ctx)
      ) {
        ctx.stateMachine.dispatch(FLYING_ENEMY_EVENTS.RETURN);
        return;
      }

      ctx.enemy.flipX = ctx.player.pos.x <= ctx.enemy.pos.x;
      ctx.enemy.moveTo(
        ctx.engine.vec2(ctx.player.pos.x, ctx.player.pos.y + 12),
        ctx.enemy.pursuitSpeed
      );
    },
  },

  [FLYING_ENEMY_EVENTS.RETURN]: {
    onUpdate: (ctx: FlyingEnemyContext): void => {
      if (!ctx.enemy.curAnim()) ctx.enemy.play(BAT_ANIMATIONS.FLYING);

      if (!StatePredicates.isAlive(ctx)) return;

      if (StatePredicates.canReachPlayer(ctx)) {
        ctx.stateMachine.dispatch(FLYING_ENEMY_EVENTS.ALERT);
        return;
      }

      if (StatePredicates.isAtInitialPosition(ctx)) {
        ctx.stateMachine.dispatch(FLYING_ENEMY_EVENTS.PATROL_RIGHT);
        return;
      }

      ctx.enemy.flipX = ctx.enemy.initialPos.x <= ctx.enemy.pos.x;
      ctx.enemy.moveTo(ctx.enemy.initialPos, ctx.enemy.speed);
    },
  },
});

class FlyingEnemyStateMachine extends StateMachine<FlyingEnemyContext> {
  public isPatrolling = (): boolean => {
    const state = this.getState() as FlyingEnemyState;
    return (
      state === FLYING_ENEMY_EVENTS.PATROL_LEFT ||
      state === FLYING_ENEMY_EVENTS.PATROL_RIGHT
    );
  };

  public isAttacking = (): boolean =>
    this.getState() === FLYING_ENEMY_EVENTS.ATTACK;

  public isReturning = (): boolean =>
    this.getState() === FLYING_ENEMY_EVENTS.RETURN;

  public isAlert = (): boolean => this.getState() === FLYING_ENEMY_EVENTS.ALERT;
}

const createStateMachineConfig =
  (): StateMachineConfig<FlyingEnemyContext> => {
    const handlers = createStateHandlers();

    return {
      initial: FLYING_ENEMY_EVENTS.PATROL_RIGHT,
      states: {
        [FLYING_ENEMY_EVENTS.PATROL_RIGHT]: {
          onEnter: wrapWithPauseCheckCtx(handlers[FLYING_ENEMY_EVENTS.PATROL_RIGHT].onEnter),
          onUpdate: wrapWithPauseCheckCtx(handlers[FLYING_ENEMY_EVENTS.PATROL_RIGHT].onUpdate),
          transitions: {
            [FLYING_ENEMY_EVENTS.PATROL_LEFT]: FLYING_ENEMY_EVENTS.PATROL_LEFT,
            [FLYING_ENEMY_EVENTS.ALERT]: FLYING_ENEMY_EVENTS.ALERT,
          },
        },
        [FLYING_ENEMY_EVENTS.PATROL_LEFT]: {
          onEnter: wrapWithPauseCheckCtx(handlers[FLYING_ENEMY_EVENTS.PATROL_LEFT].onEnter),
          onUpdate: wrapWithPauseCheckCtx(handlers[FLYING_ENEMY_EVENTS.PATROL_LEFT].onUpdate),
          transitions: {
            [FLYING_ENEMY_EVENTS.PATROL_RIGHT]: FLYING_ENEMY_EVENTS.PATROL_RIGHT,
            [FLYING_ENEMY_EVENTS.ALERT]: FLYING_ENEMY_EVENTS.ALERT,
          },
        },
        [FLYING_ENEMY_EVENTS.ALERT]: {
          onEnter: wrapWithPauseCheckCtx(handlers[FLYING_ENEMY_EVENTS.ALERT].onEnter),
          transitions: {
            [FLYING_ENEMY_EVENTS.ATTACK]: FLYING_ENEMY_EVENTS.ATTACK,
            [FLYING_ENEMY_EVENTS.RETURN]: FLYING_ENEMY_EVENTS.RETURN,
          },
        },
        [FLYING_ENEMY_EVENTS.ATTACK]: {
          onUpdate: wrapWithPauseCheckCtx(handlers[FLYING_ENEMY_EVENTS.ATTACK].onUpdate),
          transitions: {
            [FLYING_ENEMY_EVENTS.RETURN]: FLYING_ENEMY_EVENTS.RETURN,
          },
        },
        [FLYING_ENEMY_EVENTS.RETURN]: {
          onUpdate: wrapWithPauseCheckCtx(handlers[FLYING_ENEMY_EVENTS.RETURN].onUpdate),
          transitions: {
            [FLYING_ENEMY_EVENTS.ALERT]: FLYING_ENEMY_EVENTS.ALERT,
            [FLYING_ENEMY_EVENTS.PATROL_RIGHT]: FLYING_ENEMY_EVENTS.PATROL_RIGHT,
          },
        },
      },
    };
  };

function createFlyingEnemyStateMachine(
  context: Omit<FlyingEnemyContext, "stateMachine">
): FlyingEnemyStateMachine {
  const config = createStateMachineConfig();
  const ctx = { ...context } as FlyingEnemyContext;

  const stateMachine = new FlyingEnemyStateMachine(config, ctx);
  ctx.stateMachine = stateMachine;

  return stateMachine;
}

function setupEventHandlers(
  engine: Engine,
  enemy: Enemy,
  player: Player
): void {
  function applyCollisionDamage(player: Player): void {
    player.hurt(1, enemy);
  }

  async function onPlayerCollision(): Promise<void> {
    if (enemy.hp() <= 0 || enemy.isKnockedBack) return;
    applyCollisionDamage(player);
    await applyKnockback({
      engine,
      target: enemy,
      source: player,
      strength: 5,
    });
  }

  function onAnimationEnd(anim: string): void {
    if (anim === BAT_ANIMATIONS.EXPLODE) {
      engine.destroy(enemy);
    }
  }

  function onExplode(): void {
    enemy.collisionIgnore = [TAGS.PLAYER];
    enemy.unuse("body");
    enemy.play(BAT_ANIMATIONS.EXPLODE);
  }

  function onSwordHitboxCollision(): void {
    enemy.hurt(1);
  }

  async function onHurt(): Promise<void> {
    if (enemy.hp() === 0) {
      return enemy.trigger(FLYING_ENEMY_EVENTS.EXPLODE);
    }

    enemy.play(BAT_ANIMATIONS.HURT);
    await applyKnockback({
      engine,
      target: enemy,
      source: player,
      strength: 2,
    });
  }

  enemy.onCollide(TAGS.PLAYER, onPlayerCollision);
  enemy.onCollide(HITBOX_TAGS.PLAYER_SWORD, onSwordHitboxCollision);
  enemy.on(FLYING_ENEMY_EVENTS.EXPLODE, onExplode);
  enemy.on(ENGINE_DEFAULT_EVENTS.HURT, onHurt);
  enemy.onAnimEnd(onAnimationEnd);
}

function setupPositionReset(enemy: Enemy): void {
  function onExitScreen(): void {
    if (enemy.pos.dist(enemy.initialPos) > POSITION_RESET_DISTANCE) {
      enemy.pos.x = enemy.initialPos.x;
      enemy.pos.y = enemy.initialPos.y;
    }
  }

  enemy.onExitScreen(onExitScreen);
}

export function FlyingEnemySystem({
  engine,
  enemy,
}: {
  engine: Engine;
  enemy: Enemy;
}): void {
  const [player] = engine.get(TAGS.PLAYER, { recursive: true }) as Player[];

  const stateMachine = createFlyingEnemyStateMachine({
    engine,
    enemy,
    player,
  });

  function handlePauseStateChange(paused: boolean): void {
    if (!paused) {
      stateMachine.enterState(stateMachine.getState());
    }
  }

  GLOBAL_STATE_CONTROLLER.subscribe(
    GLOBAL_STATE.IS_PAUSED,
    handlePauseStateChange
  );

  setupEventHandlers(engine, enemy, player);
  setupPositionReset(enemy);

  enemy.enterState = (state: string): void => {
    stateMachine.enterState(state);
  };

  enemy.state = stateMachine.getState();

  engine.onUpdate(() => {
    enemy.state = stateMachine.getState();
    stateMachine.update();
  });
}

export type { FlyingEnemyStateMachine };
export { StatePredicates };