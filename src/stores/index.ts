import { atom, createStore } from "jotai";

export const playerHpAtom = atom(4);
export const maxPlayerHpAtom = atom(4);

export const isDoubleJumpUnlockedAtom = atom(false);

export const isPlayerInBossFightAtom = atom(false);
export const isBossDefeatedAtom = atom(false);

export const isPausedAtom = atom(false);
export const isScreenFadeOnAtom = atom(false);

export const isMainMenuOpened = atom(false);
export const startGameEvent = atom(0);
export const emitStartGameEvent = atom(null, (get, set) => {
  set(startGameEvent, get(startGameEvent) + 1);
});
;
export const store = createStore();
