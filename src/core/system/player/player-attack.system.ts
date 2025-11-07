import { PLAYER_ANIMATIONS } from "../../../types/animations.enum";
import type { Engine, EngineGameObj } from "../../../types/engine.interface";
import type { Player } from "../../../types/player.interface";
import { HITBOX_TAGS } from "../../../types/tags.enum";
import { isPaused } from "../../../utils/wrap-with-pause-check";
import { type PlayerStateMachine } from "./player-state-machine";

type Params = {
  engine: Engine;
  player: Player;
  stateMachine: PlayerStateMachine;
};

type SwordHitbox = {
  destroy: () => void;
};

export function PlayerAttackSystem({ engine, player, stateMachine }: Params) {
  player.controlHandlers = player.controlHandlers || [];

  const HITBOX_START_FRAME = 1;
  const HITBOX_END_FRAME = 5;

  let currentSwordHitbox: SwordHitbox | null = null;
  let lastCheckedFrame = -1;

  const handleKeyPress = async (key: string) => {
    if (isPaused()) return;
    if (key !== "z") return;
    if (stateMachine.isAttacking()) return;
    stateMachine.dispatch("ATTACK");
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

  function createSwordHitbox(): SwordHitbox {
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
    ]) as unknown as SwordHitbox;

    return hitbox;
  }

  function destroySwordHitbox() {
    if (!currentSwordHitbox) return;
    if (typeof currentSwordHitbox.destroy === "function") {
      currentSwordHitbox.destroy();
    } else {
      engine.destroy(currentSwordHitbox as EngineGameObj);
    }
    currentSwordHitbox = null;
  }

  function onAttackAnimationEnd(anim: string) {
    if (anim !== PLAYER_ANIMATIONS.ATTACK) return;
    destroySwordHitbox();
    lastCheckedFrame = -1;

    if (stateMachine.getState() === PLAYER_ANIMATIONS.ATTACK) {
      stateMachine.dispatch("IDLE");
    }
  }

  player.controlHandlers.push(engine.onKeyPress(handleKeyPress));
  player.onAnimEnd(onAttackAnimationEnd);
  engine.onUpdate(checkAnimationFrame);
}
