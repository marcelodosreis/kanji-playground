import { atom, createStore } from "jotai";

export const isPausedAtom = atom(false);
export const pauseTextAtom = atom("Game is Paused");


export const store = createStore();