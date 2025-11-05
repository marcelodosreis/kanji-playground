import type { Engine } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";

type Params = {
  engine: Engine;
  player: Player;
};

export function PlayerAttackSystem({ engine, player }: Params) {
  player.controlHandlers = player.controlHandlers || [];

  const handleKeyPress = async (key: string) => {
    if (key !== "z") return;
    if (player.curAnim() === "attack") return;

    player.isAttacking = true;
    createSwordHitbox();
    player.play("attack");
    player.onAnimEnd(onAttackAnimationEnd);
  };

  function createSwordHitbox(followPlayer = true) {
    const hitboxWidth = 8;
    const hitboxHeight = 10;
    const offsetX = player.flipX ? -20 : 5;
    const offsetY = 10;

    const hitboxShape = new engine.Rect(
      engine.vec2(0),
      hitboxWidth,
      hitboxHeight
    );

    if (followPlayer) {
      player.add([
        engine.pos(offsetX, offsetY),
        engine.area({ shape: hitboxShape }),
        "sword-hitbox",
      ]);
    } else {
      const hitboxX = player.pos.x + offsetX;
      const hitboxY = player.pos.y + offsetY;
      engine.add([
        engine.pos(hitboxX, hitboxY),
        engine.area({ shape: hitboxShape }),
        "sword-hitbox",
      ]);
    }
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
