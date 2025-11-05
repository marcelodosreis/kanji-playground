import type { Engine } from "../../types/engine.interface";
import type { Boss } from "../../types/boss.interface";
import { createBlink } from "../../utils/create-blink";
import { createNotificationBox } from "../../utils/create-notification-box";
import { state } from "../state";
import { BURNER_ANIMATIONS } from "../../types/animations.enum";
import { BOSS_EVENTS } from "../../types/events.enum";

type Params = {
  engine: Engine;
  boss: Boss;
};

export function BossEventSystem({ engine, boss }: Params) {
  function onSwordHitboxCollision() {
    boss.hurt(1);
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

  function onExplode() {
    boss.enterState(BOSS_EVENTS.EXPLODE);
    boss.collisionIgnore = ["player"];
    boss.unuse("body");
    boss.play(BURNER_ANIMATIONS.EXPLODE);
    state.set("isBossDefeated", true);
    state.set("isDoubleJumpUnlocked", true);

    const notification = engine.add(
      createNotificationBox(
        engine,
        "You unlocked a new ability!\nYou can now double jump."
      )
    );
    engine.wait(3, () => notification.close());
  }

  function onHurt() {
    createBlink(engine, boss);
    if (boss.hp() > 0) return;
    boss.trigger(BOSS_EVENTS.EXPLODE);
  }

  boss.onCollide("sword-hitbox", onSwordHitboxCollision);
  boss.onAnimEnd(onAnimationEnd);
  boss.on(BOSS_EVENTS.EXPLODE, onExplode);
  boss.on("hurt", onHurt);
}
