export const PLAYER_CONFIG = {
  input: {
    keys: {
      moveLeft: "left",
      moveRight: "right",
      jump: "x",
      attack: "z",
    },
  },

  movement: {
    speed: 160,
    direction: {
      left: -1,
      right: 1,
    },
  },

  jump: {
    maxJumps: 2,
    doubleJumpForce: 320,
    coyoteTimeMs: 80,
    bufferMs: 50,
    holdTimeMs: 380,
    holdGravityScale: 0.38,
    shortHopMultiplier: 0.11,
    endFrame: 4,
  },

  combat: {
    attack: {
      cooldownMs: 300,
      knockbackStrength: 0.2,
      hitbox: {
        startFrame: 1,
        endFrame: 5,
        width: 32,
        height: 16,
        offsetY: -8,
      },
      slash: {
        spriteName: "slash-effect",
        animationName: "slash",
        spawnFrame: 0,
        offsetX: 54,
        offsetY: 8,
        scale: 1,
      },
      hitConfirm: {
        scale: 1.2,
      },
    },
    hurt: {
      lockDurationMs: 400,
      blinkCount: 5,
      knockbackStrength: 1,
    },
  },

  animation: {
    jumpEndFrame: 4,
    explodeLastFrame: 109,
  },

  respawn: {
    minHpForFullRespawn: 1,
    deathWaitSeconds: 2,
    fadeDurationSeconds: 0.4,
    outOfBoundsPenalty: 1,
  },

  camera: {
    scale: 2,
    horizontalOffset: 160,
    transitionDuration: 0.8,
  },
} as const;

export type PlayerConfig = typeof PLAYER_CONFIG;
