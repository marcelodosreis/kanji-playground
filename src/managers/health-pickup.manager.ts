import type { TiledObject } from "../types/tiled-map.interface";
import { TAGS } from "../types/tags.enum";

import { MapLayer, MapLayerHelper } from "../helpers/map-layer-helper";
import type { EngineGameObj } from "../types/engine.type";
import type { Player } from "../types/player.interface";
import { HealthPickupEntity } from "../entities/health-pickup.entity";
import { GLOBAL_STATE_CONTROLLER } from "../core/global-state-controller";
import {
  BaseEntityManager,
  type BaseManagerParams,
} from "../types/entity-manager.abstract";

export type HealthPickupManagerParams = BaseManagerParams;

export class HealthPickupManager extends BaseEntityManager<EngineGameObj[]> {
  private constructor(params: HealthPickupManagerParams) {
    super(params);
  }

  public static setup(params: HealthPickupManagerParams): EngineGameObj[] {
    const manager = new HealthPickupManager(params);
    return manager.setup();
  }

  public setup(): EngineGameObj[] {
    const positions = this.resolveSpawnPositions();
    return this.spawnEntities(positions);
  }

  private resolveSpawnPositions(): TiledObject[] {
    return MapLayerHelper.getObjects(this.tiledMap, MapLayer.PIN).filter(
      (pos) => pos.type === TAGS.HEALTH_PICKUP
    );
  }

  private spawnEntities(positions: TiledObject[]): EngineGameObj[] {
    return positions.map((pos) => {
      const pickup = this.createEntity(pos);
      this.initializeCollision(pickup);
      return pickup;
    });
  }

  private createEntity(position: TiledObject): EngineGameObj {
    return this.map.add(
      HealthPickupEntity(this.engine, this.engine.vec2(position.x, position.y))
    );
  }

  private initializeCollision(healthPickup: EngineGameObj): void {
    healthPickup.onCollide(TAGS.PLAYER, (player: Player) => {
      this.handlePickup(healthPickup, player);
    });
  }

  private handlePickup(healthPickup: EngineGameObj, player: Player): void {
    if (player.hp() < GLOBAL_STATE_CONTROLLER.current().maxPlayerHp) {
      player.heal(1);
    }
    this.engine.destroy(healthPickup);
  }
}
