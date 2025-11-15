import { useEffect } from "react";
import { GAME } from "../../constansts/game.constant";

export function useGameScale() {
  useEffect(() => {
    const app = document.getElementById("app");
    if (!app) return;

    const updateScale = () => {
      const scale = Math.min(
        app.offsetWidth / GAME.WIDTH,
        app.offsetHeight / GAME.HEIGHT
      );
      document.documentElement.style.setProperty("--scale", scale.toString());
    };

    const observer = new ResizeObserver(updateScale);
    observer.observe(app);
    updateScale();

    return () => observer.disconnect();
  }, []);
}
