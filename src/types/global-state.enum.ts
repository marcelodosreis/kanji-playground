export enum GLOBAL_STATE {
  PLAYER_HP = "playerHp",
  MAX_PLAYER_HP = "maxPlayerHp",
  IS_DOUBLE_JUMP_UNLOCKED = "isDoubleJumpUnlocked",
  IS_PLAYER_IN_BOSS_FIGHT = "isPlayerInBossFight",
  IS_BOSS_DEFEATED = "isBossDefeated",
  IS_PAUSED = "isPaused",
}

export type GLOBAL_STATE_VALUES = {
  [GLOBAL_STATE.PLAYER_HP]: number;
  [GLOBAL_STATE.MAX_PLAYER_HP]: number;
  [GLOBAL_STATE.IS_DOUBLE_JUMP_UNLOCKED]: boolean;
  [GLOBAL_STATE.IS_PLAYER_IN_BOSS_FIGHT]: boolean;
  [GLOBAL_STATE.IS_BOSS_DEFEATED]: boolean;
  [GLOBAL_STATE.IS_PAUSED]: boolean;
};
