import type { Engine } from "../../types/engine.interface";
import type { Boss } from "../../types/boss.interface";
import type { Player } from "../../types/player.interface";
import { state } from "../state";

export function BossBehaviorSystem(engine: Engine, boss: Boss) {
  const player = engine.get("player", { recursive: true })[0] as Player;

  boss.onStateUpdate("idle", () => {
    if (state.current().isPlayerInBossFight) {
      boss.enterState("follow");
    }
  });

  boss.onStateEnter("follow", () => boss.play("run"));

  boss.onStateUpdate("follow", () => {
    boss.flipX = player.pos.x <= boss.pos.x;
    boss.moveTo(
      engine.vec2(player.pos.x, player.pos.y + 12),
      boss.pursuitSpeed
    );

    if (boss.pos.dist(player.pos) < boss.fireRange) {
      boss.enterState("open-fire");
    }
  });

  boss.onStateEnter("open-fire", () => {
    boss.play("open-fire");
  });

  boss.onStateEnter("fire", () => {
    // const flamethrowerSound = engine.play("flamethrower");
    const fireHitbox = boss.add([
      engine.area({ shape: new engine.Rect(engine.vec2(0), 70, 10) }),
      engine.pos(boss.flipX ? -70 : 0, 5),
      "fire-hitbox",
    ]);

    fireHitbox.onCollide("player", () => {
      player.hurt(1);
      if (player.hp() === 0) state.set("isPlayerInBossFight", false);
    });

    engine.wait(boss.fireDuration, () => {
      // flamethrowerSound.stop();
      boss.enterState("shut-fire");
    });
  });

  boss.onStateEnd("fire", () => {
    const fireHitbox = engine.get("fire-hitbox", { recursive: true })[0];
    if (fireHitbox) engine.destroy(fireHitbox);
  });

  boss.onStateUpdate("fire", () => {
    if (boss.curAnim() !== "fire") boss.play("fire");
  });

  boss.onStateEnter("shut-fire", () => {
    boss.play("shut-fire");
  });
}
