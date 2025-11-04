import type { TiledMap } from "../types/tiled-map";

export async function loadTiledMap(path: string): Promise<TiledMap> {
  const response = await fetch(path);
  return response.json();
}
