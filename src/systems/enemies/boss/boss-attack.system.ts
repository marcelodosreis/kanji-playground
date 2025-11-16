import type { Boss } from "../../../types/boss.interface";
import type { Engine } from "../../../types/engine.type";
import { BOSS_EVENTS, ENGINE_DEFAULT_EVENTS } from "../../../types/events.enum";
import type { Player } from "../../../types/player.interface";
import { isPaused } from "../../../utils/is-paused";
import type { BossStateMachine } from "./boss-state-machine";
import { HITBOX_TAGS, TAGS } from "../../../types/tags.enum";
import { createTransientHitbox } from "../../../helpers/hitbox.helper";
import { isPlayerInBossFightAtom, store } from "../../../stores";

type Params = {
  engine: Engine;
  boss: Boss;
  player: Player;
  stateMachine: BossStateMachine;
};

export function BossAttackSystem({
  engine,
  boss,
  player,
  stateMachine,
}: Params) {
  let hitboxDestroy: (() => void) | null = null;
  let fireTimerScheduled = false;
  let prevState = stateMachine.getState();

  function createFireHitbox() {
    if (hitboxDestroy) return;

    const offsetX = boss.flipX ? -70 : 0;

    const { destroy } = createTransientHitbox({
      engine,
      owner: boss,
      width: 70,
      height: 10,
      offsetX,
      offsetY: 5,
      tag: HITBOX_TAGS.BOSS_FIRE_HITBOX,
      collideWithTag: TAGS.PLAYER,
      onCollide: () => {
        player.hurt(1, boss);
      },
    });

    hitboxDestroy = destroy;
  }

  function destroyFireHitboxes() {
    if (hitboxDestroy) {
      hitboxDestroy();
      hitboxDestroy = null;
    }

    const fireHitboxes = engine.get(HITBOX_TAGS.BOSS_FIRE_HITBOX, {
      recursive: true,
    });
    for (const hb of fireHitboxes) {
      try {
        engine.destroy(hb);
      } catch (e) {}
    }
  }

  function scheduleShutFire() {
    if (fireTimerScheduled) return;
    fireTimerScheduled = true;

    engine.wait(boss.fireDuration, () => {
      if (stateMachine.getState() === BOSS_EVENTS.FIRE) {
        stateMachine.dispatch(BOSS_EVENTS.SHUT_FIRE);
      }
      fireTimerScheduled = false;
    });
  }

  function runUpdate() {
    if (isPaused()) return;

    boss.flipX = player.pos.x <= boss.pos.x;
    boss.moveTo(
      engine.vec2(player.pos.x, player.pos.y + 12),
      boss.pursuitSpeed
    );

    if (boss.pos.dist(player.pos) < boss.fireRange) {
      stateMachine.dispatch(BOSS_EVENTS.OPEN_FIRE);
    }
  }

  engine.onUpdate(() => {
    if (boss.hp() <= 0 || isPaused()) return;
    const state = stateMachine.getState();

    if (state !== prevState) {
      if (state === BOSS_EVENTS.FIRE) {
        createFireHitbox();
        scheduleShutFire();
      } else if (state === BOSS_EVENTS.SHUT_FIRE || state === BOSS_EVENTS.RUN) {
        destroyFireHitboxes();
      } else if (state === BOSS_EVENTS.EXPLODE) {
        destroyFireHitboxes();
        fireTimerScheduled = false;
      }

      if (prevState === BOSS_EVENTS.FIRE && state !== BOSS_EVENTS.FIRE) {
        fireTimerScheduled = false;
      }

      prevState = state;
    }

    if (stateMachine.isIdle() && store.get(isPlayerInBossFightAtom)) {
      stateMachine.dispatch(BOSS_EVENTS.RUN);
    } else if (stateMachine.isRunning()) {
      runUpdate();
    }
  });

  function onHurtOrDie() {
    if (boss.hp() <= 0) {
      destroyFireHitboxes();
      fireTimerScheduled = false;
    }
  }

  boss.on(ENGINE_DEFAULT_EVENTS.HURT, onHurtOrDie);
}
