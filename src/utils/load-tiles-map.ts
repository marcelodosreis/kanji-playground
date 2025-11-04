import type { TiledMap } from "../types/tiled-map.interface";

export async function loadTiledMap(path: string): Promise<TiledMap> {
  const response = await fetch(path);
  return response.json();
}
