import { isPausedAtom, store } from "../stores";

export const isPaused = () => {
  return store.get(isPausedAtom);
};
