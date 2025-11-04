import type { State } from "../types/state.interface";

type StateProperty = keyof State;

interface StateManager {
  current(): State;
  set<K extends StateProperty>(property: K, value: State[K]): void;
}

function initStateManager(): StateManager {
  const state: State = {
    playerHp: 3,
    maxPlayerHp: 3,
    isDoubleJumpUnlocked: false,
    isPlayerInBossFight: false,
    isBossDefeated: false,
  };

  return {
    current() {
      return { ...state };
    },
    set(property, value) {
      state[property] = value;
    },
  };
}

export const state = initStateManager();