import type { Engine, EngineGameObj } from "../../types/engine.type";
import type { Player } from "../../types/player.interface";
import { PLAYER_ANIMATIONS } from "../../types/animations.enum";

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
  OFFSET_Y: 24,
  SCALE: 1,
} as const;

export function PlayerSlashEffectSystem({ engine, player }: Params) {
  let lastCheckedFrame = -1;
  let activeSlash: SlashEffect | null = null;

  const updateSlashPosition = (): void => {
    if (!activeSlash || !activeSlash.exists()) {
      activeSlash = null;
      return;
    }

    const offsetX = player.flipX ? -SLASH_CONFIG.OFFSET_X : SLASH_CONFIG.OFFSET_X;
    activeSlash.pos = engine.vec2(
      player.pos.x + offsetX,
      player.pos.y + SLASH_CONFIG.OFFSET_Y
    );

    // Atualiza o espelhamento se o player virou
    const shouldFlip = player.flipX;
    activeSlash.flipX = shouldFlip;
  };

  const spawnSlash = (): void => {
    // Destroi slash anterior se existir
    if (activeSlash && activeSlash.exists()) {
      activeSlash.destroy();
    }

    const offsetX = player.flipX ? -SLASH_CONFIG.OFFSET_X : SLASH_CONFIG.OFFSET_X;

    activeSlash = engine.add([
      engine.sprite(SLASH_CONFIG.SPRITE_NAME),
      engine.pos(player.pos.x + offsetX, player.pos.y + SLASH_CONFIG.OFFSET_Y),
      engine.anchor("center"),
      engine.scale(SLASH_CONFIG.SCALE),
    ]) as SlashEffect;

    // Aplica o flip inicial
    activeSlash.flipX = player.flipX;

    // Inicia a animação
    activeSlash.play(SLASH_CONFIG.ANIMATION_NAME);

    // Quando a animação terminar, destroi o slash
    activeSlash.onAnimEnd(() => {
      if (activeSlash) {
        activeSlash.destroy();
        activeSlash = null;
      }
    });
  };

  const checkAnimationFrame = (): void => {
    const currentAnim = player.curAnim();
    
    // Reseta se não estiver atacando
    if (currentAnim !== PLAYER_ANIMATIONS.ATTACK) {
      lastCheckedFrame = -1;
      return;
    }

    const currentFrame = player.animFrame;

    // Spawna o slash no frame correto
    if (currentFrame === SLASH_CONFIG.SPAWN_FRAME && currentFrame !== lastCheckedFrame) {
      spawnSlash();
    }

    lastCheckedFrame = currentFrame;
  };

  engine.onUpdate(() => {
    checkAnimationFrame();
    updateSlashPosition();
  });
}