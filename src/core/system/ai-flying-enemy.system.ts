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
import { FLYING_ENEMY_EVENTS } from "../../types/events.enum";
import { TAGS } from "../../types/tags.enum";
import {
  isPaused,
  wrapWithPauseCheck,
} from "../../utils/wrap-with-pause-check";
import { state } from "../global-state-controller";
import { GLOBAL_STATE } from "../../types/state.interface";
import { BAT_ANIMATIONS } from "../../types/animations.enum";
import { StateMachine, type StateMachineConfig } from "../state-machine";

type Context = {
  engine: Engine;
  enemy: Enemy;
  player: Player;
  stateMachine: StateMachine<Context>;
};

const RETURN_THRESHOLD = 20;

function isPlayerInRange(ctx: Context): boolean {
  return ctx.enemy.pos.dist(ctx.player.pos) < ctx.enemy.range;
}

function isAtInitialPosition(ctx: Context): boolean {
  return ctx.enemy.pos.dist(ctx.enemy.initialPos) < RETURN_THRESHOLD;
}

function isBeyondPursuitLimit(ctx: Context): boolean {
  return (
    ctx.enemy.pos.dist(ctx.enemy.initialPos) > ctx.enemy.maxPursuitDistance
  );
}

function canReachPlayer(ctx: Context): boolean {
  const distanceToPlayer = ctx.enemy.pos.dist(ctx.player.pos);
  const distancePlayerFromInitial = ctx.player.pos.dist(ctx.enemy.initialPos);
  return (
    distancePlayerFromInitial <= ctx.enemy.maxPursuitDistance &&
    distanceToPlayer < ctx.enemy.range
  );
}

function wrapWithPauseCheckCtx<T>(callback: (ctx: T) => void | Promise<void>) {
  return (ctx: T) => wrapWithPauseCheck(() => callback(ctx))();
}

async function handlePatrolRightEnter(ctx: Context) {
  if (!ctx.enemy.curAnim()) ctx.enemy.play(BAT_ANIMATIONS.FLYING);
  await ctx.engine.wait(3);
  if (
    ctx.enemy.state === FLYING_ENEMY_EVENTS.PATROL_RIGHT &&
    ctx.enemy.hp() > 0 &&
    !isPaused()
  ) {
    ctx.stateMachine.dispatch(FLYING_ENEMY_EVENTS.PATROL_LEFT);
  }
}

function handlePatrolRightUpdate(ctx: Context) {
  if (ctx.enemy.hp() <= 0) return;
  if (isPlayerInRange(ctx)) {
    ctx.stateMachine.dispatch(FLYING_ENEMY_EVENTS.ALERT);
    return;
  }
  ctx.enemy.flipX = false;
  ctx.enemy.move(ctx.enemy.speed, 0);
}

async function handlePatrolLeftEnter(ctx: Context) {
  if (!ctx.enemy.curAnim()) ctx.enemy.play(BAT_ANIMATIONS.FLYING);
  await ctx.engine.wait(3);
  if (
    ctx.enemy.state === FLYING_ENEMY_EVENTS.PATROL_LEFT &&
    ctx.enemy.hp() > 0 &&
    !isPaused()
  ) {
    ctx.stateMachine.dispatch(FLYING_ENEMY_EVENTS.PATROL_RIGHT);
  }
}

function handlePatrolLeftUpdate(ctx: Context) {
  if (ctx.enemy.hp() <= 0) return;
  if (isPlayerInRange(ctx)) {
    ctx.stateMachine.dispatch(FLYING_ENEMY_EVENTS.ALERT);
    return;
  }
  ctx.enemy.flipX = true;
  ctx.enemy.move(-ctx.enemy.speed, 0);
}

async function handleAlertEnter(ctx: Context) {
  if (!ctx.enemy.curAnim()) ctx.enemy.play(BAT_ANIMATIONS.FLYING);
  await ctx.engine.wait(0.5);
  if (ctx.enemy.hp() <= 0 || isPaused()) return;
  if (isPlayerInRange(ctx)) {
    ctx.stateMachine.dispatch(FLYING_ENEMY_EVENTS.ATTACK);
  } else {
    ctx.stateMachine.dispatch(FLYING_ENEMY_EVENTS.RETURN);
  }
}

function handleAttackUpdate(ctx: Context) {
  if (!ctx.enemy.curAnim()) ctx.enemy.play(BAT_ANIMATIONS.FLYING);
  if (ctx.enemy.hp() <= 0 || ctx.enemy.isKnockedBack) return;
  if (isBeyondPursuitLimit(ctx) || !isPlayerInRange(ctx)) {
    ctx.stateMachine.dispatch(FLYING_ENEMY_EVENTS.RETURN);
    return;
  }
  ctx.enemy.flipX = ctx.player.pos.x <= ctx.enemy.pos.x;
  ctx.enemy.moveTo(
    ctx.engine.vec2(ctx.player.pos.x, ctx.player.pos.y + 12),
    ctx.enemy.pursuitSpeed
  );
}

function handleReturnUpdate(ctx: Context) {
  if (!ctx.enemy.curAnim()) ctx.enemy.play(BAT_ANIMATIONS.FLYING);
  if (ctx.enemy.hp() <= 0) return;
  if (canReachPlayer(ctx)) {
    ctx.stateMachine.dispatch(FLYING_ENEMY_EVENTS.ALERT);
    return;
  }
  if (isAtInitialPosition(ctx)) {
    ctx.stateMachine.dispatch(FLYING_ENEMY_EVENTS.PATROL_RIGHT);
    return;
  }
  ctx.enemy.flipX = ctx.enemy.initialPos.x <= ctx.enemy.pos.x;
  ctx.enemy.moveTo(ctx.enemy.initialPos, ctx.enemy.speed);
}

export function AIFlyingEnemySystem({
  engine,
  enemy,
}: {
  engine: Engine;
  enemy: Enemy;
}) {
  const [player] = engine.get(TAGS.PLAYER, { recursive: true }) as Player[];
  let stateMachine: StateMachine<Context>;

  const context: Context = {
    engine,
    enemy,
    player,
    get stateMachine() {
      return stateMachine;
    },
  };

  const config: StateMachineConfig<Context> = {
    initial: FLYING_ENEMY_EVENTS.PATROL_RIGHT,
    states: {
      [FLYING_ENEMY_EVENTS.PATROL_RIGHT]: {
        onEnter: wrapWithPauseCheckCtx(handlePatrolRightEnter),
        onUpdate: wrapWithPauseCheckCtx(handlePatrolRightUpdate),
        transitions: {
          [FLYING_ENEMY_EVENTS.PATROL_LEFT]: FLYING_ENEMY_EVENTS.PATROL_LEFT,
          [FLYING_ENEMY_EVENTS.ALERT]: FLYING_ENEMY_EVENTS.ALERT,
        },
      },
      [FLYING_ENEMY_EVENTS.PATROL_LEFT]: {
        onEnter: wrapWithPauseCheckCtx(handlePatrolLeftEnter),
        onUpdate: wrapWithPauseCheckCtx(handlePatrolLeftUpdate),
        transitions: {
          [FLYING_ENEMY_EVENTS.PATROL_RIGHT]: FLYING_ENEMY_EVENTS.PATROL_RIGHT,
          [FLYING_ENEMY_EVENTS.ALERT]: FLYING_ENEMY_EVENTS.ALERT,
        },
      },
      [FLYING_ENEMY_EVENTS.ALERT]: {
        onEnter: wrapWithPauseCheckCtx(handleAlertEnter),
        transitions: {
          [FLYING_ENEMY_EVENTS.ATTACK]: FLYING_ENEMY_EVENTS.ATTACK,
          [FLYING_ENEMY_EVENTS.RETURN]: FLYING_ENEMY_EVENTS.RETURN,
        },
      },
      [FLYING_ENEMY_EVENTS.ATTACK]: {
        onUpdate: wrapWithPauseCheckCtx(handleAttackUpdate),
        transitions: {
          [FLYING_ENEMY_EVENTS.RETURN]: FLYING_ENEMY_EVENTS.RETURN,
        },
      },
      [FLYING_ENEMY_EVENTS.RETURN]: {
        onUpdate: wrapWithPauseCheckCtx(handleReturnUpdate),
        transitions: {
          [FLYING_ENEMY_EVENTS.ALERT]: FLYING_ENEMY_EVENTS.ALERT,
          [FLYING_ENEMY_EVENTS.PATROL_RIGHT]: FLYING_ENEMY_EVENTS.PATROL_RIGHT,
        },
      },
    },
  };

  stateMachine = new StateMachine<Context>(config, context);

  function handleIsPausedChange(paused: boolean) {
    if (!paused) {
      stateMachine.enterState(stateMachine.getState());
    }
  }

  state.subscribe(GLOBAL_STATE.IS_PAUSED, handleIsPausedChange);

  enemy.enterState = (state: string) => {
    stateMachine.enterState(state);
  };

  enemy.state = stateMachine.getState();

  engine.onUpdate(() => {
    enemy.state = stateMachine.getState();
    stateMachine.update();
  });
}
