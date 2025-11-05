import type { Engine } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";

type Params = {
  engine: Engine;
  player: Player;
};

export function PlayerInputSystem({ engine, player }: Params) {
  player.controlHandlers = [];

  player.controlHandlers.push(
    engine.onKeyPress((key) => {
      if (key === "x") {
        if (player.curAnim() !== "jump") player.play("jump");
        player.doubleJump();
      }

      if (key === "z" && player.curAnim() !== "attack" && player.isGrounded()) {
        player.isAttacking = true;
        player.add([
          engine.pos(player.flipX ? -25 : 0, 10),
          engine.area({ shape: new engine.Rect(engine.vec2(0), 25, 10) }),
          "sword-hitbox",
        ]);
        player.play("attack");

        player.onAnimEnd((anim) => {
          if (anim === "attack") {
            const swordHitbox = engine.get("sword-hitbox", {
              recursive: true,
            })[0];
            if (swordHitbox) engine.destroy(swordHitbox);
            player.isAttacking = false;
            player.play("idle");
          }
        });
      }
    })
  );

  player.controlHandlers.push(
    engine.onKeyDown((key) => {
      if (key === "left" && !player.isAttacking) {
        if (player.curAnim() !== "run" && player.isGrounded()) {
          player.play("run");
        }
        player.flipX = true;
        player.move(-player.speed, 0);
        return;
      }

      if (key === "right" && !player.isAttacking) {
        if (player.curAnim() !== "run" && player.isGrounded()) {
          player.play("run");
        }
        player.flipX = false;
        player.move(player.speed, 0);
        return;
      }
    })
  );

  player.controlHandlers.push(
    engine.onKeyRelease(() => {
      if (
        player.curAnim() !== "idle" &&
        player.curAnim() !== "jump" &&
        player.curAnim() !== "fall" &&
        player.curAnim() !== "attack"
      )
        player.play("idle");
    })
  );
}
