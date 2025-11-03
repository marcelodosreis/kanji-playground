import type {
  KAPLAYCtx,
  GameObj,
  PosComp,
  SpriteComp,
  AreaComp,
  AnchorComp,
  BodyComp,
  DoubleJumpComp,
  OpacityComp,
  HealthComp,
  KEventController,
} from "kaplay";

export type Engine = KAPLAYCtx;

export type PlayerEngineGameObj = GameObj<
  | PosComp
  | SpriteComp
  | AreaComp
  | AnchorComp
  | BodyComp
  | DoubleJumpComp
  | OpacityComp
  | HealthComp
>;

export type MapEngineGameObj = GameObj<PosComp | SpriteComp>

export type EngineEventCtrl = KEventController;
