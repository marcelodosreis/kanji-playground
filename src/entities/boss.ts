import { state } from "../core/state";
import type { Boss } from "../types/boss";
import type { Engine } from "../types/engine";
import type { Position } from "../types/position";
import type { Player } from "../types/player";
import { createBlink } from "../utils/create-blink";
import { createNotificationBox } from "../utils/create-notification-box";

export function createBoss(engine: Engine, initialPos: Position): Boss {
  return engine.make([
    engine.pos(initialPos),
    engine.sprite("burner", { anim: "idle" }),
    engine.area({ shape: new engine.Rect(engine.vec2(0, 10), 12, 12) }),
    engine.body({ mass: 100, jumpForce: 320 }),
    engine.anchor("center"),
    engine.state("idle", [
      "idle",
      "follow",
      "open-fire",
      "fire",
      "shut-fire",
      "explode",
    ]),
    engine.health(1),
    engine.opacity(1),
    {
      pursuitSpeed: 100,
      fireRange: 40,
      fireDuration: 1,
      setBehavior(this: Boss) {
        const player = engine.get("player", { recursive: true })[0] as Player;

        this.onStateUpdate("idle", () => {
          if (state.current().isPlayerInBossFight) {
            this.enterState("follow");
          }
        });

        this.onStateEnter("follow", () => this.play("run"));

        this.onStateUpdate("follow", () => {
          this.flipX = player.pos.x <= this.pos.x;
          this.moveTo(
            engine.vec2(player.pos.x, player.pos.y + 12),
            this.pursuitSpeed
          );

          if (this.pos.dist(player.pos) < this.fireRange) {
            this.enterState("open-fire");
          }
        });

        this.onStateEnter("open-fire", () => {
          this.play("open-fire");
        });

        this.onStateEnter("fire", () => {
        //   const flamethrowerSound = engine.play("flamethrower");
          const fireHitbox = this.add([
            engine.area({ shape: new engine.Rect(engine.vec2(0), 70, 10) }),
            engine.pos(this.flipX ? -70 : 0, 5),
            "fire-hitbox",
          ]);

          fireHitbox.onCollide("player", () => {
            player.hurt(1);
            if (player.hp() === 0)
              state.set("isPlayerInBossFight", false);
          });

          engine.wait(this.fireDuration, () => {
            // flamethrowerSound.stop();
            this.enterState("shut-fire");
          });
        });

        this.onStateEnd("fire", () => {
          const fireHitbox = engine.get("fire-hitbox", { recursive: true })[0];
          if (fireHitbox) engine.destroy(fireHitbox);
        });

        this.onStateUpdate("fire", () => {
          if (this.curAnim() !== "fire") this.play("fire");
        });

        this.onStateEnter("shut-fire", () => {
          this.play("shut-fire");
        });
      },
      setEvents(this: Boss) {
        const player = engine.get("player", { recursive: true })[0] as Player;

        this.onCollide("sword-hitbox", () => {
        //   engine.play("boom");
          this.hurt(1);
        });

        this.onAnimEnd((anim) => {
          switch (anim) {
            case "open-fire":
              this.enterState("fire");
              break;
            case "shut-fire":
              this.enterState("follow");
              break;
            case "explode":
              engine.destroy(this);
              break;
            default:
          }
        });

        this.on("explode", () => {
          this.enterState("explode");
          this.collisionIgnore = ["player"];
          this.unuse("body");
        //   engine.play("boom");
          this.play("explode");
          state.set("isBossDefeated", true);
          state.set("isDoubleJumpUnlocked", true);
          player.enableDoubleJump();
        //   engine.play("notify");

          const notification = engine.add(
            createNotificationBox(
              engine,
              "You unlocked a new ability!\nYou can now double jump."
            )
          );
          engine.wait(3, () => notification.close());
        });

        this.on("hurt", () => {
          createBlink(engine, this);
          if (this.hp() > 0) return;
          this.trigger("explode");
        });
      },
    },
  ]);
}
