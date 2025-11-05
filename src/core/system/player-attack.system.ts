import type { Engine } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";

type Params = {
  engine: Engine;
  player: Player;
};

export function PlayerAttackSystem({ engine, player }: Params) {
  player.controlHandlers = player.controlHandlers || [];

  function handleKeyPress(key: string) {
    if (key !== "z") return;
    if (player.curAnim() === "attack" || !player.isGrounded()) return;

    player.isAttacking = true;
    createSwordHitbox();
    player.play("attack");

    player.onAnimEnd(onAttackAnimationEnd);
  }

  function createSwordHitbox() {
    player.add([
      engine.pos(player.flipX ? -25 : 0, 10),
      engine.area({ shape: new engine.Rect(engine.vec2(0), 25, 10) }),
      "sword-hitbox",
    ]);
  }

  function onAttackAnimationEnd(anim: string) {
    if (anim !== "attack") return;

    const swordHitbox = engine.get("sword-hitbox", { recursive: true })[0];
    if (swordHitbox) {
      engine.destroy(swordHitbox);
    }
    player.isAttacking = false;
    player.play("idle");
  }

  player.controlHandlers.push(engine.onKeyPress(handleKeyPress));
}
