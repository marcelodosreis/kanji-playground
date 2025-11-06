import { PLAYER_ANIMATIONS } from "../../types/animations.enum";
import type { Engine } from "../../types/engine.interface";
import type { Player } from "../../types/player.interface";
import { HITBOX_TAGS } from "../../types/tags.enum";
import { isPaused } from "../../utils/wrap-with-pause-check";

type Params = {
  engine: Engine;
  player: Player;
};

export function PlayerAttackSystem({ engine, player }: Params) {
  player.controlHandlers = player.controlHandlers || [];

  const handleKeyPress = async (key: string) => {
    if (isPaused()) return;
    if (key !== "z" || player.curAnim() === PLAYER_ANIMATIONS.ATTACK) return;

    player.isAttacking = true;
    createSwordHitbox();
    player.play(PLAYER_ANIMATIONS.ATTACK);
    player.onAnimEnd(onAttackAnimationEnd);
  };

  function createSwordHitbox(followPlayer = true) {
    const hitboxWidth = 8;
    const hitboxHeight = 10;
    const offsetX = player.flipX ? -20 : 12;
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
        HITBOX_TAGS.PLAYER_SWORD,
      ]);
    } else {
      const hitboxX = player.pos.x + offsetX;
      const hitboxY = player.pos.y + offsetY;
      engine.add([
        engine.pos(hitboxX, hitboxY),
        engine.area({ shape: hitboxShape }),
        HITBOX_TAGS.PLAYER_SWORD,
      ]);
    }
  }

  function onAttackAnimationEnd(anim: string) {
    if (anim !== PLAYER_ANIMATIONS.ATTACK) return;

    const [swordHitbox] = engine.get(HITBOX_TAGS.PLAYER_SWORD, {
      recursive: true,
    });
    if (swordHitbox) {
      engine.destroy(swordHitbox);
    }
    player.isAttacking = false;
    player.play(PLAYER_ANIMATIONS.IDLE);
  }

  player.controlHandlers.push(engine.onKeyPress(handleKeyPress));
}
