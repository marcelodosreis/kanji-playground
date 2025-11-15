import type { Engine, EngineGameObj } from "../../../types/engine.type";
import type { Player } from "../../../types/player.interface";
import { PLAYER_ANIMATIONS } from "../../../types/animations.enum";

type Params = {
  engine: Engine;
  player: Player;
};

type SlashEffect = EngineGameObj & {
  play: (anim: string) => void;
  onAnimEnd: (callback: (anim: string) => void) => void;
};

const SLASH_CONFIG = {
  SPRITE_NAME: "slash-effect",
  ANIMATION_NAME: "slash",
  SPAWN_FRAME: 0,
  OFFSET_X: 54,
  OFFSET_Y: 8,
  SCALE: 1,
} as const;

export function PlayerAttackSlashEffectSystem({ engine, player }: Params) {
  let lastCheckedFrame = -1;
  let activeSlash: SlashEffect | null = null;

  const updateSlashPosition = (): void => {
    if (!activeSlash || !activeSlash.exists()) {
      activeSlash = null;
      return;
    }

    const offsetX = player.flipX
      ? -SLASH_CONFIG.OFFSET_X
      : SLASH_CONFIG.OFFSET_X;
    activeSlash.pos = engine.vec2(
      player.pos.x + offsetX,
      player.pos.y + SLASH_CONFIG.OFFSET_Y
    );

    const shouldFlip = player.flipX;
    activeSlash.flipX = shouldFlip;
  };

  const spawnSlash = (): void => {
    if (activeSlash && activeSlash.exists()) {
      activeSlash.destroy();
    }

    const offsetX = player.flipX
      ? -SLASH_CONFIG.OFFSET_X
      : SLASH_CONFIG.OFFSET_X;

    activeSlash = engine.add([
      engine.sprite(SLASH_CONFIG.SPRITE_NAME),
      engine.pos(player.pos.x + offsetX, player.pos.y + SLASH_CONFIG.OFFSET_Y),
      engine.anchor("center"),
      engine.scale(SLASH_CONFIG.SCALE),
    ]) as SlashEffect;

    activeSlash.flipX = player.flipX;

    activeSlash.play(SLASH_CONFIG.ANIMATION_NAME);

    activeSlash.onAnimEnd(() => {
      if (activeSlash) {
        activeSlash.destroy();
        activeSlash = null;
      }
    });
  };

  const checkAnimationFrame = (): void => {
    const currentAnim = player.curAnim();

    if (currentAnim !== PLAYER_ANIMATIONS.ATTACK) {
      lastCheckedFrame = -1;
      return;
    }

    const currentFrame = player.animFrame;

    if (
      currentFrame === SLASH_CONFIG.SPAWN_FRAME &&
      currentFrame !== lastCheckedFrame
    ) {
      spawnSlash();
    }

    lastCheckedFrame = currentFrame;
  };

  engine.onUpdate(() => {
    checkAnimationFrame();
    updateSlashPosition();
  });
}
