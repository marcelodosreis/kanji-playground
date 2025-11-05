import type { Engine } from "../../types/engine.interface";
import type { Boss } from "../../types/boss.interface";
import type { Player } from "../../types/player.interface";
import { state } from "../state";
import { BURNER_ANIMATIONS } from "../../types/animations.enum";
import { BOSS_EVENTS } from "../../types/events.enum";
import { HITBOX_TAGS, TAGS } from "../../types/tags.enum";

type Params = {
  engine: Engine;
  boss: Boss;
};

export function BossBehaviorSystem({ engine, boss }: Params) {
  const [player] = engine.get(TAGS.PLAYER, { recursive: true }) as Player[];

  const idleUpdate = () => {
    if (state.current().isPlayerInBossFight) {
      boss.enterState(BOSS_EVENTS.RUN);
    }
  };

  const followEnter = () => {
    boss.play(BURNER_ANIMATIONS.RUN);
  };

  const followUpdate = () => {
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
    const [fireHitbox] = engine.get(HITBOX_TAGS.BOSS_FIRE_HITBOX, {
      recursive: true,
    });
    if (fireHitbox) {
      engine.destroy(fireHitbox);
    }
  };

  const fireUpdate = () => {
    if (boss.curAnim() !== BURNER_ANIMATIONS.FIRE) {
      boss.play(BURNER_ANIMATIONS.FIRE);
    }
  };

  const shutFireEnter = () => {
    boss.play(BURNER_ANIMATIONS.SHUT_FIRE);
  };

  boss.onStateUpdate(BOSS_EVENTS.IDLE, idleUpdate);
  boss.onStateEnter(BOSS_EVENTS.RUN, followEnter);
  boss.onStateUpdate(BOSS_EVENTS.RUN, followUpdate);
  boss.onStateEnter(BOSS_EVENTS.FIRE, fireEnter);
  boss.onStateEnd(BOSS_EVENTS.FIRE, fireEnd);
  boss.onStateUpdate(BOSS_EVENTS.FIRE, fireUpdate);
  boss.onStateEnter(BOSS_EVENTS.OPEN_FIRE, openFireEnter);
  boss.onStateEnter(BOSS_EVENTS.SHUT_FIRE, shutFireEnter);
}
