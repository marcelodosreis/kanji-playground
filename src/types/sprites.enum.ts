export enum FLY_ENEMY_SPRITES {
  ORANGE = "orange_fly_enemy",
  PURPLE = "purple_fly_enemy",
}

export type BAT_SPRITES = FLY_ENEMY_SPRITES.PURPLE | FLY_ENEMY_SPRITES.ORANGE;

export enum SPRITES {
  PLAYER = "player",
  BURNER = "burner",
  CARTRIDGE = "cartridge",
}
