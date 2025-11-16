import { atom, createStore } from "jotai";

export const playerHpAtom = atom(3);
export const maxPlayerHpAtom = atom(3);

export const isDoubleJumpUnlockedAtom = atom(false);

export const isPlayerInBossFightAtom = atom(false);
export const isBossDefeatedAtom = atom(false);

export const isPausedAtom = atom(false);
export const isScreenFadeOnAtom = atom(false);

export const store = createStore();
