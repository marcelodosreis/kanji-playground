import type { Engine } from "../../types/engine.interface";
import type { Boss } from "../../types/boss.interface";
import type { Player } from "../../types/player.interface";
import { BURNER_ANIMATIONS } from "../../types/animations.enum";
import { BOSS_EVENTS } from "../../types/events.enum";
import { HITBOX_TAGS, TAGS } from "../../types/tags.enum";
import { isPaused } from "../../utils/wrap-with-pause-check";
import { state } from "../global-state-controller";
import { GLOBAL_STATE } from "../../types/state.interface";

type Params = { engine: Engine; boss: Boss };

export function AIBossSystem({ engine, boss }: Params) {
  const [player] = engine.get(TAGS.PLAYER, { recursive: true }) as Player[];

  async function handleIsPausedChange(paused: boolean) {
    if (!paused) {
      if (boss.curAnim() === BURNER_ANIMATIONS.FIRE) {
        await engine.wait(0.5);
        fireEnd();
      }
      boss.enterState(boss.state);
    }
  }

  function idleUpdate() {
    if (state.current().isPlayerInBossFight) {
      boss.enterState(BOSS_EVENTS.RUN);
    }
  }

  function followEnter() {
    if (isPaused()) return;
    boss.play(BURNER_ANIMATIONS.RUN);
  }

  function followUpdate() {
    if (isPaused()) return;
    boss.flipX = player.pos.x <= boss.pos.x;
    boss.moveTo(
      engine.vec2(player.pos.x, player.pos.y + 12),
      boss.pursuitSpeed
    );

    if (boss.pos.dist(player.pos) < boss.fireRange) {
      boss.enterState(BOSS_EVENTS.OPEN_FIRE);
    }
  }

  function openFireEnter() {
    if (isPaused()) return;
    boss.play(BURNER_ANIMATIONS.OPEN_FIRE);
  }

  function fireEnter() {
    if (isPaused()) return;

    const fireHitbox = boss.add([
      engine.area({ shape: new engine.Rect(engine.vec2(0), 70, 10) }),
      engine.pos(boss.flipX ? -70 : 0, 5),
      HITBOX_TAGS.BOSS_FIRE_HITBOX,
    ]);

    fireHitbox.onCollide(TAGS.PLAYER, () => {
      player.hurt(1, boss);
    });

    engine.wait(boss.fireDuration, () => {
      boss.enterState(BOSS_EVENTS.SHUT_FIRE);
    });
  }

  function fireUpdate() {
    if (isPaused()) return;
    if (boss.curAnim() !== BURNER_ANIMATIONS.FIRE) {
      boss.play(BURNER_ANIMATIONS.FIRE);
    }
  }

  function fireEnd() {
    if (isPaused()) return;
    const [fireHitbox] = engine.get(HITBOX_TAGS.BOSS_FIRE_HITBOX, {
      recursive: true,
    });
    if (fireHitbox) {
      engine.destroy(fireHitbox);
    }
  }

  function shutFireEnter() {
    if (isPaused()) return;
    boss.play(BURNER_ANIMATIONS.SHUT_FIRE);
  }

  function start() {
    state.subscribe(GLOBAL_STATE.IS_PAUSED, handleIsPausedChange);

    boss.onStateEnter(BOSS_EVENTS.RUN, followEnter);
    boss.onStateUpdate(BOSS_EVENTS.RUN, followUpdate);
    boss.onStateEnter(BOSS_EVENTS.OPEN_FIRE, openFireEnter);
    boss.onStateEnter(BOSS_EVENTS.FIRE, fireEnter);
    boss.onStateUpdate(BOSS_EVENTS.FIRE, fireUpdate);
    boss.onStateEnd(BOSS_EVENTS.FIRE, fireEnd);
    boss.onStateEnter(BOSS_EVENTS.SHUT_FIRE, shutFireEnter);
    boss.onStateUpdate(BOSS_EVENTS.IDLE, idleUpdate);
  }

  start();
}
