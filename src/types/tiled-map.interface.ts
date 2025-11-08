import type { Vec2 } from "kaplay";

export interface TiledMap {
  compressionlevel: number;
  height: number;
  width: number;
  infinite: boolean;
  layers: TiledLayer[];
  nextlayerid: number;
  nextobjectid: number;
  orientation: string;
  renderorder: string;
  tiledversion: string;
  tileheight: number;
  tilewidth: number;
  tilesets: TiledTileset[];
  type: string;
  version: string;
}

interface TiledLayer {
  data?: number[];
  height?: number;
  width?: number;
  id: number;
  name: string;
  opacity: number;
  type: string;
  visible: boolean;
  x: number;
  y: number;
  draworder?: string;
  objects?: TiledObject[];
}

export interface TiledObject {
  height: number;
  width: number;
  id: number;
  name: string;
  rotation: number;
  type: string;
  visible: boolean;
  x: number;
  y: number;
  polygon?: [Vec2];
  properties: [{ value: number }];
}

interface TiledTileset {
  firstgid: number;
  source: string;
}
