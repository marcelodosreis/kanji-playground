import type { TiledObject } from "../../types/tiled-map.interface";
import { TAGS } from "../../types/tags.enum";
import type { Boss } from "../../types/boss.interface";
import type { Player } from "../../types/player.interface";
import {
  BaseEntityManager,
  type BaseManagerParams,
} from "../../types/entity-manager.abstract";
import { TiledObjectHelper } from "../../helpers/tiled-object.helper";
import { EntityFactory } from "../../factories/entity-factory";
import { getPlayer } from "../../utils/get-player";
import { SystemRegistryFactory } from "../../factories/system-registry-factory";
import { createBossStateMachine } from "../system/enemies/boss/boss-state-machine";

export type BossManagerParams = BaseManagerParams;

export class BossManager extends BaseEntityManager<Boss[]> {
  private constructor(params: BossManagerParams) {
    super(params);
  }

  public static setup(params: BossManagerParams): Boss[] {
    const instance = new BossManager(params);
    return instance.setup();
  }

  public setup(): Boss[] {
    const spawnPoints = this.resolveSpawnPositions();
    return this.spawnEntities(spawnPoints);
  }

  private resolveSpawnPositions(): TiledObject[] {
    const bossObj = TiledObjectHelper.findByName(this.tiledMap, TAGS.BOSS);
    return bossObj ? [bossObj] : [];
  }

  private spawnEntities(spawnPoints: TiledObject[]): Boss[] {
    const player = getPlayer({ engine: this.engine });
    if (!player) return [];

    return spawnPoints.map((point) => {
      const boss = this.createEntity(point);
      this.initializeSystems(boss, player);
      return boss;
    });
  }

  private createEntity(position: TiledObject): Boss {
    const boss = EntityFactory.createBoss(
      this.engine,
      this.map,
      position.x,
      position.y
    );
    return boss;
  }

  private initializeSystems(boss: Boss, player: Player): void {
    const stateMachine = createBossStateMachine({
      engine: this.engine,
      boss,
      player,
    });

    SystemRegistryFactory.registerBossSystems({
      engine: this.engine,
      boss,
      player,
      stateMachine,
    });
  }
}
