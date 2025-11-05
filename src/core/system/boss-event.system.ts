import type { Engine } from "../../types/engine.interface";
import type { Boss } from "../../types/boss.interface";
import { createBlink } from "../../utils/create-blink";
import { createNotificationBox } from "../../utils/create-notification-box";
import { state } from "../state";

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
      case "open-fire":
        boss.enterState("fire");
        break;
      case "shut-fire":
        boss.enterState("follow");
        break;
      case "explode":
        engine.destroy(boss);
        break;
    }
  }

  function onExplode() {
    boss.enterState("explode");
    boss.collisionIgnore = ["player"];
    boss.unuse("body");
    boss.play("explode");
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
    boss.trigger("explode");
  }

  boss.onCollide("sword-hitbox", onSwordHitboxCollision);
  boss.onAnimEnd(onAnimationEnd);
  boss.on("explode", onExplode);
  boss.on("hurt", onHurt);
}