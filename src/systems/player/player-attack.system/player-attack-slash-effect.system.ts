import { PLAYER_CONFIG } from "../../../constansts/player.constat";
import type { Engine, EngineGameObj } from "../../../types/engine.type";
import type { PlayerSystemWithAPI } from "../../../types/player-system.interface";
import type { Player } from "../../../types/player.interface";
import {
  AnimationChecks,
  AnimationFrameChecks,
} from "../../../utils/animation.utils";

type Params = {
  engine: Engine;
  player: Player;
};

type SlashEffect = EngineGameObj & {
  play: (anim: string) => void;
  onAnimEnd: (callback: (anim: string) => void) => void;
};

const SLASH_CONFIG = PLAYER_CONFIG.combat.attack.slash;

export function PlayerAttackSlashEffectSystem({
  engine,
  player,
}: Params): PlayerSystemWithAPI<{}> {
  let lastCheckedFrame = -1;
  let activeSlash: SlashEffect | null = null;

  const updateSlashPosition = (): void => {
    if (!activeSlash || !activeSlash.exists()) {
      activeSlash = null;
      return;
    }

    const offsetX = player.flipX ? -SLASH_CONFIG.offsetX : SLASH_CONFIG.offsetX;
    activeSlash.pos = engine.vec2(
      player.pos.x + offsetX,
      player.pos.y + SLASH_CONFIG.offsetY
    );

    activeSlash.flipX = player.flipX;
  };

  const spawnSlash = (): void => {
    if (activeSlash && activeSlash.exists()) {
      activeSlash.destroy();
    }

    const offsetX = player.flipX ? -SLASH_CONFIG.offsetX : SLASH_CONFIG.offsetX;

    activeSlash = engine.add([
      engine.sprite(SLASH_CONFIG.spriteName),
      engine.pos(player.pos.x + offsetX, player.pos.y + SLASH_CONFIG.offsetY),
      engine.anchor("center"),
      engine.scale(SLASH_CONFIG.scale),
    ]) as SlashEffect;

    activeSlash.flipX = player.flipX;
    activeSlash.play(SLASH_CONFIG.animationName);

    activeSlash.onAnimEnd(() => {
      if (activeSlash) {
        activeSlash.destroy();
        activeSlash = null;
      }
    });
  };

  const updateSlashEffect = (): void => {
    const currentAnim = player.curAnim();

    if (!currentAnim || !AnimationChecks.isAttack(currentAnim)) {
      lastCheckedFrame = -1;
      return;
    }

    const currentFrame = player.animFrame;

    if (
      AnimationFrameChecks.isAtFrame(currentFrame, SLASH_CONFIG.spawnFrame) &&
      currentFrame !== lastCheckedFrame
    ) {
      spawnSlash();
    }

    lastCheckedFrame = currentFrame;
  };

  const update = (): void => {
    updateSlashEffect();
    updateSlashPosition();
  };

  engine.onUpdate(update);

  return {
    update,
  };
}
