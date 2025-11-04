import type { Enemy } from "../types/enemy";
import type { Engine } from "../types/engine";
import type { Player } from "../types/player";
import type { Position } from "../types/position";

export function createDrone(engine: Engine, initialPos: Position): Enemy {
  return engine.make([
    "drone",
    engine.pos(initialPos),
    engine.sprite("drone", { anim: "flying" }),
    engine.area({ shape: new engine.Rect(engine.vec2(0), 12, 12) }),
    engine.anchor("center"),
    engine.body({ gravityScale: 0 }),
    engine.offscreen({ distance: 400 }),
    engine.state("patrol-right", [
      "patrol-right",
      "patrol-left",
      "alert",
      "attack",
      "retreat",
    ]),
    engine.health(1),
    {
      speed: 100,
      pursuitSpeed: 150,
      range: 100,
      setBehavior(this: Enemy) {
        const player = engine.get("player", { recursive: true })[0] as Player;

        this.onStateEnter("patrol-right", async () => {
          await engine.wait(3);
          if (this.state === "patrol-right") this.enterState("patrol-left");
        });

        this.onStateUpdate("patrol-right", () => {
          if (this.pos.dist(player.pos) < this.range) {
            this.enterState("alert");
            return;
          }
          this.flipX = false;
          this.move(this.speed, 0);
        });

        this.onStateEnter("patrol-left", async () => {
          await engine.wait(3);
          if (this.state === "patrol-left") this.enterState("patrol-right");
        });

        this.onStateUpdate("patrol-left", () => {
          if (this.pos.dist(player.pos) < this.range) {
            this.enterState("alert");
            return;
          }
          this.flipX = true;
          this.move(-this.speed, 0);
        });

        this.onStateEnter("alert", async () => {
          await engine.wait(1);
          if (this.pos.dist(player.pos) < this.range) {
            this.enterState("attack");
            return;
          }

          this.enterState("patrol-right");
        });

        this.onStateUpdate("attack", () => {
          if (this.pos.dist(player.pos) > this.range) {
            this.enterState("alert");
            return;
          }

          this.flipX = player.pos.x <= this.pos.x;
          this.moveTo(
            engine.vec2(player.pos.x, player.pos.y + 12),
            this.pursuitSpeed
          );
        });
      },

      setEvents(this: Enemy) {
        const player = engine.get("player", { recursive: true })[0] as Player;

        this.onCollide("player", () => {
          if (player.isAttacking) return;
          this.hurt(1);
          player.hurt(1);
        });

        this.onAnimEnd((anim) => {
          if (anim === "explode") {
            engine.destroy(this);
          }
        });

        this.on("explode", () => {
          //   engine.play("boom");
          this.collisionIgnore = ["player"];
          this.unuse("body");
          this.play("explode");
        });

        this.onCollide("sword-hitbox", () => {
          this.hurt(1);
        });

        this.on("hurt", () => {
          if (this.hp() === 0) {
            this.trigger("explode");
          }
        });

        this.onExitScreen(() => {
          if (this.pos.dist(initialPos) > 400) this.pos = initialPos;
        });
      },
    },
  ]);
}
