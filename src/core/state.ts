import type { State } from "../types/state.interface";

type StateProperty = keyof State;

type Listener<K extends StateProperty> = (value: State[K]) => void;

interface StateManager {
  current(): State;
  set<K extends StateProperty>(property: K, value: State[K]): void;
  subscribe<K extends StateProperty>(
    property: K,
    listener: Listener<K>
  ): () => void;
}

function initStateManager(): StateManager {
  const state: State = {
    playerHp: 3,
    maxPlayerHp: 3,
    isDoubleJumpUnlocked: false,
    isPlayerInBossFight: false,
    isBossDefeated: false,
  };

  const listeners = new Map<StateProperty, Set<Listener<any>>>();

  return {
    current() {
      return { ...state };
    },

    set<K extends StateProperty>(property: K, value: State[K]) {
      state[property] = value;
      const setListeners = listeners.get(property);
      if (setListeners) {
        (setListeners as Set<Listener<K>>).forEach((listener) => {
          listener(value);
        });
      }
    },

    subscribe<K extends StateProperty>(property: K, listener: Listener<K>) {
      if (!listeners.has(property)) {
        listeners.set(property, new Set());
      }
      const setListeners = listeners.get(property)!;
      (setListeners as Set<Listener<K>>).add(listener);

      return () => {
        (setListeners as Set<Listener<K>>).delete(listener);
      };
    },
  };
}

export const state = initStateManager();
