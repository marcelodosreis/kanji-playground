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

  const HITBOX_START_FRAME = 1;
  const HITBOX_END_FRAME = 5;

  let currentSwordHitbox: any = null;
  let lastCheckedFrame = -1;

  const handleKeyPress = async (key: string) => {
    if (isPaused()) return;
    if (key !== "z" || player.curAnim() === PLAYER_ANIMATIONS.ATTACK) return;

    player.isAttacking = true;
    player.play(PLAYER_ANIMATIONS.ATTACK);
    lastCheckedFrame = -1;
  };

  const checkAnimationFrame = () => {
    if (player.curAnim() !== PLAYER_ANIMATIONS.ATTACK) return;

    const currentFrame = player.animFrame;

    if (currentFrame === lastCheckedFrame) return;
    lastCheckedFrame = currentFrame;

    if (currentFrame === HITBOX_START_FRAME && !currentSwordHitbox) {
      currentSwordHitbox = createSwordHitbox();
    }

    if (currentFrame === HITBOX_END_FRAME && currentSwordHitbox) {
      destroySwordHitbox();
    }
  };

  function createSwordHitbox() {
    const hitboxWidth = 18;
    const hitboxHeight = 16;
    const offsetX = player.flipX ? -18 : 0;
    const offsetY = 9;

    const hitboxShape = new engine.Rect(
      engine.vec2(0),
      hitboxWidth,
      hitboxHeight
    );

    const hitbox = player.add([
      engine.pos(offsetX, offsetY),
      engine.area({ shape: hitboxShape }),
      HITBOX_TAGS.PLAYER_SWORD,
    ]);

    return hitbox;
  }

  function destroySwordHitbox() {
    if (currentSwordHitbox) {
      engine.destroy(currentSwordHitbox);
      currentSwordHitbox = null;
    }
  }

  function onAttackAnimationEnd(anim: string) {
    if (anim !== PLAYER_ANIMATIONS.ATTACK) return;

    destroySwordHitbox();

    player.isAttacking = false;
    player.play(PLAYER_ANIMATIONS.IDLE);
    lastCheckedFrame = -1;
  }

  player.controlHandlers.push(engine.onKeyPress(handleKeyPress));
  player.onAnimEnd(onAttackAnimationEnd);
  engine.onUpdate(checkAnimationFrame);
}
