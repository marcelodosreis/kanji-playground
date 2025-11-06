import type { Engine } from "../../types/engine.interface";
import type { Boss } from "../../types/boss.interface";
import type { Player } from "../../types/player.interface";
import { state } from "../state";
import { BURNER_ANIMATIONS } from "../../types/animations.enum";
import { BOSS_EVENTS } from "../../types/events.enum";
import { HITBOX_TAGS, TAGS } from "../../types/tags.enum";
import { isPaused } from "../../utils/wrap-with-pause-check";

type Params = {
  engine: Engine;
  boss: Boss;
};

export function BossBehaviorSystem({ engine, boss }: Params) {
  const [player] = engine.get(TAGS.PLAYER, { recursive: true }) as Player[];

  async function handleIsPausedChange(paused: boolean) {
    if (!paused) {
      if (boss.curAnim() === BURNER_ANIMATIONS.FIRE) {
        await engine.wait(0.5);
        fireEnd();
      }
      boss.enterState(BOSS_EVENTS.IDLE);
    }
  }

  const idleUpdate = () => {
    if (state.current().isPlayerInBossFight) {
      boss.enterState(BOSS_EVENTS.RUN);
    }
  };

  const followEnter = () => {
    if (isPaused()) return;
    boss.play(BURNER_ANIMATIONS.RUN);
  };

  const followUpdate = () => {
    if (isPaused()) return;
    boss.flipX = player.pos.x <= boss.pos.x;
    boss.moveTo(
      engine.vec2(player.pos.x, player.pos.y + 12),
      boss.pursuitSpeed
    );

    if (boss.pos.dist(player.pos) < boss.fireRange) {
      boss.enterState(BOSS_EVENTS.OPEN_FIRE);
    }
  };

  const openFireEnter = () => {
    if (isPaused()) return;
    boss.play(BURNER_ANIMATIONS.OPEN_FIRE);
  };

  const fireEnter = () => {
    const fireHitbox = boss.add([
      engine.area({ shape: new engine.Rect(engine.vec2(0), 70, 10) }),
      engine.pos(boss.flipX ? -70 : 0, 5),
      HITBOX_TAGS.BOSS_FIRE_HITBOX,
    ]);

    fireHitbox.onCollide(TAGS.PLAYER, () => {
      player.hurt(1);
      if (player.hp() === 0) {
        state.set("isPlayerInBossFight", false);
      }
    });

    engine.wait(boss.fireDuration, () => {
      boss.enterState(BOSS_EVENTS.SHUT_FIRE);
    });
  };

  const fireEnd = () => {
    if (isPaused()) return;
    const [fireHitbox] = engine.get(HITBOX_TAGS.BOSS_FIRE_HITBOX, {
      recursive: true,
    });
    if (fireHitbox) {
      engine.destroy(fireHitbox);
    }
  };

  const fireUpdate = () => {
    if (isPaused()) return;
    if (boss.curAnim() !== BURNER_ANIMATIONS.FIRE) {
      boss.play(BURNER_ANIMATIONS.FIRE);
    }
  };

  const shutFireEnter = () => {
    if (isPaused()) return;
    boss.play(BURNER_ANIMATIONS.SHUT_FIRE);
  };

  function start() {
    state.subscribe("isPaused", handleIsPausedChange);

    boss.onStateEnter(BOSS_EVENTS.RUN, followEnter);
    boss.onStateEnter(BOSS_EVENTS.FIRE, fireEnter);
    boss.onStateEnter(BOSS_EVENTS.OPEN_FIRE, openFireEnter);
    boss.onStateEnter(BOSS_EVENTS.SHUT_FIRE, shutFireEnter);

    boss.onStateUpdate(BOSS_EVENTS.IDLE, idleUpdate);
    boss.onStateUpdate(BOSS_EVENTS.RUN, followUpdate);
    boss.onStateUpdate(BOSS_EVENTS.FIRE, fireUpdate);

    boss.onStateEnd(BOSS_EVENTS.FIRE, fireEnd);
  }

  start();
}
