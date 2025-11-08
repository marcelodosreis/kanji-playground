import { GLOBAL_STATE, type GLOBAL_STATE_VALUES } from "../types/global-state.enum";

type Listener<K extends GLOBAL_STATE> = (value: GLOBAL_STATE_VALUES[K]) => void;

interface GlobalStateManagerController {
  current(): GLOBAL_STATE_VALUES;
  set<K extends GLOBAL_STATE>(property: K, value: GLOBAL_STATE_VALUES[K]): void;
  subscribe<K extends GLOBAL_STATE>(property: K, listener: Listener<K>): () => void;
}

function initGlobalStateController(): GlobalStateManagerController {
  const state: GLOBAL_STATE_VALUES = {
    [GLOBAL_STATE.PLAYER_HP]: 3,
    [GLOBAL_STATE.MAX_PLAYER_HP]: 3,
    [GLOBAL_STATE.IS_DOUBLE_JUMB_UNLOCKED]: false,
    [GLOBAL_STATE.IS_PLAYER_IN_BOSS_FIGHT]: false,
    [GLOBAL_STATE.IS_BOSS_DEFEATED]: false,
    [GLOBAL_STATE.IS_PAUSED]: false,
  };

  const listeners = new Map<GLOBAL_STATE, Set<Listener<any>>>();

  return {
    current() {
      return { ...state };
    },

    set<K extends GLOBAL_STATE>(property: K, value: GLOBAL_STATE_VALUES[K]) {
      state[property] = value;
      const setListeners = listeners.get(property);
      if (setListeners) {
        (setListeners as Set<Listener<K>>).forEach((listener) =>
          listener(value)
        );
      }
    },

    subscribe<K extends GLOBAL_STATE>(property: K, listener: Listener<K>) {
      if (!listeners.has(property)) {
        listeners.set(property, new Set());
      }
      (listeners.get(property) as Set<Listener<K>>).add(listener);

      return () => {
        (listeners.get(property) as Set<Listener<K>>).delete(listener);
      };
    },
  };
}

export const GLOBAL_STATE_CONTROLLER = initGlobalStateController();
