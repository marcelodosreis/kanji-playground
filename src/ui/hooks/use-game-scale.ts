import { useEffect } from "react";

const GAME_WIDTH = 640;
const GAME_HEIGHT = 360;

export function useGameScale() {
  useEffect(() => {
    const app = document.getElementById("app");
    if (!app) return;

    const updateScale = () => {
      const scale = Math.min(
        app.offsetWidth / GAME_WIDTH,
        app.offsetHeight / GAME_HEIGHT
      );
      document.documentElement.style.setProperty("--scale", scale.toString());
    };

    const observer = new ResizeObserver(updateScale);
    observer.observe(app);
    updateScale();

    return () => observer.disconnect();
  }, []);
}
