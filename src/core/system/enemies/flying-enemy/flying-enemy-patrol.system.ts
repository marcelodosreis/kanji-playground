import type { Engine } from "../../../../types/engine.type";
import type { Enemy } from "../../../../types/enemy.interface";
import type { Player } from "../../../../types/player.interface";
import type { FlyingEnemyStateMachine } from "./flying-enemy-state-machine";
import { FLYING_ENEMY_EVENTS } from "../../../../types/events.enum";
import { isPaused } from "../../../../utils/is-paused";
import { FLYING_ENEMY_SPRITES } from "../../../../types/sprites.enum";

type Params = {
  engine: Engine;
  enemy: Enemy;
  player: Player;
  stateMachine: FlyingEnemyStateMachine;
};

export function FlyingEnemyPatrolSystem({
  engine,
  enemy,
  player,
  stateMachine,
}: Params) {
  const initialX = enemy.pos.x;
  const initialY = enemy.pos.y;
  
  let lastX = enemy.pos.x;
  let stuckFrames = 0;
  const STUCK_THRESHOLD = 10; // frames parados antes de considerar preso
  const MIN_MOVEMENT = 0.5; // movimento mínimo esperado por frame

  function shouldStopPatrolling(): boolean {
    return enemy.hp() <= 0 || isPaused();
  }

  function isPlayerInAttackRange(): boolean {
    return enemy.pos.dist(player.pos) < enemy.range;
  }

  function shouldReactToPlayer(): boolean {
    return enemy.behavior !== FLYING_ENEMY_SPRITES.ORANGE;
  }

  function returnToInitialHeight(): void {
    enemy.moveTo(engine.vec2(enemy.pos.x, initialY), enemy.speed);
  }

  function tryAlertPlayer(currentState: string): boolean {
    const isPatrolling =
      currentState === FLYING_ENEMY_EVENTS.PATROL_RIGHT ||
      currentState === FLYING_ENEMY_EVENTS.PATROL_LEFT;

    if (isPatrolling && isPlayerInAttackRange() && shouldReactToPlayer()) {
      stateMachine.dispatch(FLYING_ENEMY_EVENTS.ALERT);
      return true;
    }

    return false;
  }

  function isStuck(): boolean {
    const movement = Math.abs(enemy.pos.x - lastX);
    
    if (movement < MIN_MOVEMENT) {
      stuckFrames++;
    } else {
      stuckFrames = 0;
    }
    
    lastX = enemy.pos.x;
    
    return stuckFrames >= STUCK_THRESHOLD;
  }

  function patrolRight(): void {
    enemy.flipX = false;
    enemy.move(enemy.speed, 0);

    if (enemy.pos.x >= initialX + enemy.patrolDistance || isStuck()) {
      stuckFrames = 0; // reset ao mudar direção
      stateMachine.dispatch(FLYING_ENEMY_EVENTS.PATROL_LEFT);
    }
  }

  function patrolLeft(): void {
    enemy.flipX = true;
    enemy.move(-enemy.speed, 0);

    if (enemy.pos.x <= initialX - enemy.patrolDistance || isStuck()) {
      stuckFrames = 0; // reset ao mudar direção
      stateMachine.dispatch(FLYING_ENEMY_EVENTS.PATROL_RIGHT);
    }
  }

  function isPatrolling(state: string): boolean {
    return (
      state === FLYING_ENEMY_EVENTS.PATROL_RIGHT ||
      state === FLYING_ENEMY_EVENTS.PATROL_LEFT
    );
  }

  engine.onUpdate(() => {
    if (shouldStopPatrolling()) return;

    const currentState = stateMachine.getState();
    const isPatrollingYFixed = true;
    if (isPatrollingYFixed && isPatrolling(currentState)) {
      returnToInitialHeight();
    }

    if (tryAlertPlayer(currentState)) return;

    if (currentState === FLYING_ENEMY_EVENTS.PATROL_RIGHT) {
      patrolRight();
    }

    if (currentState === FLYING_ENEMY_EVENTS.PATROL_LEFT) {
      patrolLeft();
    }
  });
}