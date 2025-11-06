import type { Engine } from "../../types/engine.interface";
import type { Boss } from "../../types/boss.interface";
import type { Player } from "../../types/player.interface";
import { BURNER_ANIMATIONS } from "../../types/animations.enum";
import { BOSS_EVENTS, ENGINE_DEFAULT_EVENTS } from "../../types/events.enum";
import { HITBOX_TAGS, TAGS } from "../../types/tags.enum";
import { createBlink } from "../../utils/create-blink";
import { state } from "../state";
import { createNotificationBox } from "../../utils/create-notification-box";
import { GLOBAL_STATE } from "../../types/state.interface";

type Params = { engine: Engine; boss: Boss };

export function BossEventHandlerSystem({ engine, boss }: Params) {
  const [player] = engine.get(TAGS.PLAYER, { recursive: true }) as Player[];

  function onSwordHitboxCollision() {
    boss.hurt(1);
    if (player.isAttacking) return;
  }

  function onAnimationEnd(anim: string) {
    switch (anim) {
      case BURNER_ANIMATIONS.OPEN_FIRE:
        boss.enterState(BOSS_EVENTS.FIRE);
        break;
      case BURNER_ANIMATIONS.SHUT_FIRE:
        boss.enterState(BOSS_EVENTS.RUN);
        break;
      case BURNER_ANIMATIONS.EXPLODE:
        engine.destroy(boss);
        break;
    }
  }

  function onHurt() {
    createBlink(engine, boss);
    if (boss.hp() <= 0) {
      onExplode();
    }
  }

  function onExplode() {
    boss.trigger(BOSS_EVENTS.EXPLODE);
    boss.enterState(BOSS_EVENTS.EXPLODE);
    boss.play(BURNER_ANIMATIONS.EXPLODE);
    boss.collisionIgnore = [TAGS.PLAYER];
    boss.unuse("body");

    state.set(GLOBAL_STATE.IS_BOSS_DEFEATED, true);
    state.set(GLOBAL_STATE.IS_DOUBLE_JUMB_UNLOCKED, true);

    const notification = engine.add(
      createNotificationBox(
        engine,
        "You unlocked a new ability!\nYou can now double jump."
      )
    );
    engine.wait(3, () => notification.close());
  }

  boss.onCollide(HITBOX_TAGS.PLAYER_SWORD, onSwordHitboxCollision);

  boss.on(ENGINE_DEFAULT_EVENTS.HURT, onHurt);
  boss.onAnimEnd(onAnimationEnd);
}
