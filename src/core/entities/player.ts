import { state } from "../state";
import type { Engine } from "../../types/engine";
import type { Player } from "../../types/player";
import { createBlink } from "../../utils/create-blink";

export function PlayerEntity(engine: Engine): Player {
  return engine.make([
    "player",
    engine.pos(),
    engine.sprite("player"),
    engine.area({ shape: new engine.Rect(engine.vec2(0, 18), 12, 12) }),
    engine.anchor("center"),
    engine.body({ mass: 100, jumpForce: 320 }),
    engine.doubleJump(state.current().isDoubleJumpUnlocked ? 2 : 1),
    engine.opacity(),
    engine.health(state.current().playerHp),
    {
      speed: 150,
      controlHandlers: [],
      isAttacking: false,
      setPosition(this: Player, x: number, y: number) {
        this.pos.x = x;
        this.pos.y = y;
      },
      enablePassthrough(this: Player) {
        this.onBeforePhysicsResolve((collision) => {
          if (collision.target.is("passthrough") && this.isJumping()) {
            collision.preventResolution();
          }
        });
      },
      setControls(this: Player) {
        this.controlHandlers = [];

        this.controlHandlers.push(
          engine.onKeyPress((key) => {
            if (key === "x") {
              if (this.curAnim() !== "jump") this.play("jump");
              this.doubleJump();
            }

            if (
              key === "z" &&
              this.curAnim() !== "attack" &&
              this.isGrounded()
            ) {
              this.isAttacking = true;
              this.add([
                engine.pos(this.flipX ? -25 : 0, 10),
                engine.area({ shape: new engine.Rect(engine.vec2(0), 25, 10) }),
                "sword-hitbox",
              ]);
              this.play("attack");

              this.onAnimEnd((anim) => {
                if (anim === "attack") {
                  const swordHitbox = engine.get("sword-hitbox", {
                    recursive: true,
                  })[0];
                  if (swordHitbox) engine.destroy(swordHitbox);
                  this.isAttacking = false;
                  this.play("idle");
                }
              });
            }
          })
        );

        this.controlHandlers.push(
          engine.onKeyDown((key) => {
            if (key === "left" && !this.isAttacking) {
              if (this.curAnim() !== "run" && this.isGrounded()) {
                this.play("run");
              }
              this.flipX = true;
              this.move(-this.speed, 0);
              return;
            }

            if (key === "right" && !this.isAttacking) {
              if (this.curAnim() !== "run" && this.isGrounded()) {
                this.play("run");
              }
              this.flipX = false;
              this.move(this.speed, 0);
              return;
            }
          })
        );

        this.controlHandlers.push(
          engine.onKeyRelease(() => {
            if (
              this.curAnim() !== "idle" &&
              this.curAnim() !== "jump" &&
              this.curAnim() !== "fall" &&
              this.curAnim() !== "attack"
            )
              this.play("idle");
          })
        );
      },

      disableControls(this: Player) {
        for (const handler of this.controlHandlers) {
          handler.cancel();
        }
      },

      respawnIfOutOfBounds(
        this: Player,
        boundValue: number,
        destinationName: string,
        previousSceneData: { exitName: null }
      ) {
        engine.onUpdate(() => {
          if (this.pos.y > boundValue) {
            engine.go(destinationName, previousSceneData);
          }
        });
      },

      setEvents(this: Player) {
        this.onFall(() => {
          this.play("fall");
        });

        this.onFallOff(() => {
          this.play("fall");
        });
        this.onGround(() => {
          this.play("idle");
        });
        this.onHeadbutt(() => {
          this.play("fall");
        });

        this.on("heal", () => {
          state.set("playerHp", this.hp());
          // healthBar.trigger("update");
        });

        this.on("hurt", () => {
          createBlink(engine, this);
          if (this.hp() > 0) {
            state.set("playerHp", this.hp());
            // healthBar.trigger("update");
            return;
          }

          state.set("playerHp", state.current().maxPlayerHp);
          // engine.play("boom");
          this.play("explode");
        });

        this.onAnimEnd((anim) => {
          if (anim === "explode") {
            engine.go("room001");
          }
        });
      },

      enableDoubleJump(this: Player) {
        this.numJumps = 2;
      },
    },
  ]);
}
