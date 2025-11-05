import type { Engine } from "../../types/engine.interface";
import type { Boss } from "../../types/boss.interface";
import { createBlink } from "../../utils/create-blink";
import { createNotificationBox } from "../../utils/create-notification-box";
import { state } from "../state";

export function BossEventSystem(engine: Engine, boss: Boss) {
  boss.onCollide("sword-hitbox", () => {
    // engine.play("boom");
    boss.hurt(1);
  });

  boss.onAnimEnd((anim) => {
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
      default:
    }
  });

  boss.on("explode", () => {
    boss.enterState("explode");
    boss.collisionIgnore = ["player"];
    boss.unuse("body");
    // engine.play("boom");
    boss.play("explode");
    state.set("isBossDefeated", true);
    state.set("isDoubleJumpUnlocked", true);
    // engine.play("notify");

    const notification = engine.add(
      createNotificationBox(
        engine,
        "You unlocked a new ability!\nYou can now double jump."
      )
    );
    engine.wait(3, () => notification.close());
  });

  boss.on("hurt", () => {
    createBlink(engine, boss);
    if (boss.hp() > 0) return;
    boss.trigger("explode");
  });
}
