import type { Engine } from "../../types/engine.interface";
import type { Boss } from "../../types/boss.interface";
import type { Player } from "../../types/player.interface";
import { state } from "../state";

type Params = {
  engine: Engine;
  boss: Boss;
};

export function BossBehaviorSystem({ engine, boss }: Params) {
  const player = engine.get("player", { recursive: true })[0] as Player;

  const idleUpdate = () => {
    if (state.current().isPlayerInBossFight) {
      boss.enterState("follow");
    }
  };

  const followEnter = () => {
    boss.play("run");
  };

  const followUpdate = () => {
    boss.flipX = player.pos.x <= boss.pos.x;
    boss.moveTo(
      engine.vec2(player.pos.x, player.pos.y + 12),
      boss.pursuitSpeed
    );

    if (boss.pos.dist(player.pos) < boss.fireRange) {
      boss.enterState("open-fire");
    }
  };

  const openFireEnter = () => {
    boss.play("open-fire");
  };

  const fireEnter = () => {
    const fireHitbox = boss.add([
      engine.area({ shape: new engine.Rect(engine.vec2(0), 70, 10) }),
      engine.pos(boss.flipX ? -70 : 0, 5),
      "fire-hitbox",
    ]);

    fireHitbox.onCollide("player", () => {
      player.hurt(1);
      if (player.hp() === 0) {
        state.set("isPlayerInBossFight", false);
      }
    });

    engine.wait(boss.fireDuration, () => {
      boss.enterState("shut-fire");
    });
  };

  const fireEnd = () => {
    const fireHitbox = engine.get("fire-hitbox", { recursive: true })[0];
    if (fireHitbox) {
      engine.destroy(fireHitbox);
    }
  };

  const fireUpdate = () => {
    if (boss.curAnim() !== "fire") {
      boss.play("fire");
    }
  };

  const shutFireEnter = () => {
    boss.play("shut-fire");
  };

  boss.onStateUpdate("idle", idleUpdate);
  boss.onStateEnter("follow", followEnter);
  boss.onStateUpdate("follow", followUpdate);
  boss.onStateEnter("open-fire", openFireEnter);
  boss.onStateEnter("fire", fireEnter);
  boss.onStateEnd("fire", fireEnd);
  boss.onStateUpdate("fire", fireUpdate);
  boss.onStateEnter("shut-fire", shutFireEnter);
}
