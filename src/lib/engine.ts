import kaplay from "kaplay";
import type { Engine } from "../types/engine";

const scale = 1;
export const engine: Engine = kaplay({
  canvas: document.getElementById("game") as HTMLCanvasElement,
  width: 640 * scale,
  height: 360 * scale,
  letterbox: false,
  touchToMouse: true,
  scale,
  pixelDensity: devicePixelRatio,
  debug: true,
});

engine.loadFont("glyphmesss", "./fonts/glyphmesss.ttf");

engine.loadSprite("player", "./assets/sprites/player.png", {
  sliceX: 8,
  sliceY: 9,
  anims: {
    idle: { from: 0, to: 7, loop: true },
    run: { from: 8, to: 13, loop: true },
    jump: { from: 51, to: 51, loop: true },
    fall: { from: 54, to: 54, loop: true },
    explode: { from: 64, to: 69 },
    attack: { from: 24, to: 28, speed: 16 },
  },
});

engine.loadSprite("drone", "./assets/sprites/drone.png", {
  sliceX: 6,
  sliceY: 3,
  anims: {
    flying: { from: 0, to: 3, loop: true },
    attack: { from: 6, to: 11, loop: true },
    explode: { from: 12, to: 17 },
  },
});

engine.loadSprite("burner", "./assets/sprites/burner.png", {
  sliceX: 5,
  sliceY: 6,
  anims: {
    idle: { from: 0, to: 3, loop: true },
    run: { from: 6, to: 8, loop: true },
    "open-fire": { from: 10, to: 14 },
    fire: { from: 15, to: 18, loop: true },
    "shut-fire": { from: 20, to: 23 },
    explode: { from: 25, to: 29 },
  },
});

engine.loadSpriteAtlas("./assets/ui.png", {
  healthBar: {
    x: 16,
    y: 16,
    width: 60,
    height: 48,
    sliceY: 3,
  },
});

engine.loadSpriteAtlas("./assets/animations.png", {
  cartridge: {
    x: 125,
    y: 145,
    width: 134,
    height: 16,
    sliceX: 8,
    anims: {
      default: { from: 0, to: 4, loop: true, speed: 7 },
    },
  },
});

engine.loadSprite("tileset", "./assets/tileset.png", {
  sliceX: 33,
  sliceY: 21,
});

engine.loadSprite("background", "./assets/background.png", {
  sliceX: 13,
  sliceY: 25,
});

// AUDIOS
// engine.loadSound("notify", "./assets/sounds/notify.mp3");
// engine.loadSound("boom", "./assets/sounds/boom.wav");
// engine.loadSound("health", "./assets/sounds/health.wav");
// engine.loadSound("flamethrower", "./assets/sounds/flamethrower.mp3");

// MAPS
engine.loadSprite("room001", "./src/scenes/room-001/room-001-map.png");
engine.loadSprite("room002", "./src/scenes/room-002/room-002-map.png");