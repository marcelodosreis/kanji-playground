import type { Engine } from "../../types/engine.interface";
import type { Enemy } from "../../types/enemy.interface";
import type { Player } from "../../types/player.interface";
import { FLYING_ENEMY_EVENTS } from "../../types/events.enum";
import { TAGS } from "../../types/tags.enum";
import {
  isPaused,
  wrapWithPauseCheck,
} from "../../utils/wrap-with-pause-check";
import { state } from "../state";
import { GLOBAL_STATE } from "../../types/state.interface";

type Params = { engine: Engine; enemy: Enemy };

export function AIFlyingEnemySystem({ engine, enemy }: Params) {
  const [player] = engine.get(TAGS.PLAYER, { recursive: true }) as Player[];

  function isPlayerInRange(): boolean {
    return enemy.pos.dist(player.pos) < enemy.range;
  }

  async function patrolRightEnter() {
    await engine.wait(3);
    if (
      enemy.state === FLYING_ENEMY_EVENTS.PATROL_RIGHT &&
      enemy.hp() > 0 &&
      !isPaused()
    ) {
      enemy.enterState(FLYING_ENEMY_EVENTS.PATROL_LEFT);
    }
  }

  function patrolRightUpdate() {
    if (enemy.hp() <= 0) return;
    if (isPlayerInRange()) {
      enemy.enterState(FLYING_ENEMY_EVENTS.ALERT);
      return;
    }
    enemy.flipX = false;
    enemy.move(enemy.speed, 0);
  }

  async function patrolLeftEnter() {
    await engine.wait(3);
    if (
      enemy.state === FLYING_ENEMY_EVENTS.PATROL_LEFT &&
      enemy.hp() > 0 &&
      !isPaused()
    ) {
      enemy.enterState(FLYING_ENEMY_EVENTS.PATROL_RIGHT);
    }
  }

  function patrolLeftUpdate() {
    if (enemy.hp() <= 0) return;
    if (isPlayerInRange()) {
      enemy.enterState(FLYING_ENEMY_EVENTS.ALERT);
      return;
    }
    enemy.flipX = true;
    enemy.move(-enemy.speed, 0);
  }

  async function alertEnter() {
    await engine.wait(1);
    if (enemy.hp() <= 0 || isPaused()) return;
    if (isPlayerInRange()) {
      enemy.enterState(FLYING_ENEMY_EVENTS.ATTACK);
      return;
    }
    enemy.enterState(FLYING_ENEMY_EVENTS.PATROL_RIGHT);
  }

  function attackUpdate() {
    if (enemy.hp() <= 0) return;
    if (!isPlayerInRange()) {
      enemy.enterState(FLYING_ENEMY_EVENTS.ALERT);
      return;
    }
    enemy.flipX = player.pos.x <= enemy.pos.x;
    enemy.moveTo(
      engine.vec2(player.pos.x, player.pos.y + 12),
      enemy.pursuitSpeed
    );
  }

  function handleIsPausedChange(paused: boolean) {
    if (!paused) {
      enemy.enterState(enemy.state);
    }
  }

  function start() {
    state.subscribe(GLOBAL_STATE.IS_PAUSED, handleIsPausedChange);

    enemy.onStateEnter(
      FLYING_ENEMY_EVENTS.PATROL_RIGHT,
      wrapWithPauseCheck(patrolRightEnter)
    );
    enemy.onStateUpdate(
      FLYING_ENEMY_EVENTS.PATROL_RIGHT,
      wrapWithPauseCheck(patrolRightUpdate)
    );
    enemy.onStateEnter(
      FLYING_ENEMY_EVENTS.PATROL_LEFT,
      wrapWithPauseCheck(patrolLeftEnter)
    );
    enemy.onStateUpdate(
      FLYING_ENEMY_EVENTS.PATROL_LEFT,
      wrapWithPauseCheck(patrolLeftUpdate)
    );
    enemy.onStateEnter(FLYING_ENEMY_EVENTS.ALERT, wrapWithPauseCheck(alertEnter));
    enemy.onStateUpdate(FLYING_ENEMY_EVENTS.ATTACK, wrapWithPauseCheck(attackUpdate));
  }

  start();
}
