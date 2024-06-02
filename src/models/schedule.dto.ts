import { CoopBossInfo } from '@/enums/coop_enemy'
import { CoopMode } from '@/enums/coop_mode'
import { CoopRule } from '@/enums/coop_rule'
import { CoopStage } from '@/enums/coop_stage'
import { WeaponInfoMain } from '@/enums/main'
import { scheduleHash } from '@/utils/hash'
import { Schema as S } from '@effect/schema'
import dayjs from 'dayjs'
import { ImageURLId, IntFromBase64, Nullable } from './common.dto'

export namespace StageSchedule {
  const Node = S.Struct({
    startTime: S.DateFromString,
    endTime: S.DateFromString,
    coopStage: ImageURLId({ prefix: 'CoopStage' })
  })

  const CoopSchedule = S.Struct({
    nodes: S.Array(Node)
  })

  const Data = S.Struct({
    coopGroupingSchedule: S.Struct({
      regularSchedules: CoopSchedule,
      bigRunSchedules: CoopSchedule,
      teamCountestSchedules: CoopSchedule
    })
  })

  /**
   * @description
   * StageScheduleQuery
   */
  export const Query = S.Struct({
    data: Data
  })

  export type Query = typeof Query.Type
}

export namespace CoopSchedule {
  /**
   * @description
   * CoopScheduleQuery
   */
  export const Query = S.Struct({
    id: S.String,
    startTime: Nullable(S.DateFromString),
    endTime: Nullable(S.DateFromString),
    mode: S.Enums(CoopMode),
    rule: S.Enums(CoopRule),
    bossId: Nullable(S.Enums(CoopBossInfo.Id)),
    stageId: S.Enums(CoopStage.Id),
    rareWeapons: S.Array(S.Enums(WeaponInfoMain.Id)),
    weaponList: S.Array(S.Enums(WeaponInfoMain.Id))
  })

  export class Response {
    readonly id: string
    readonly startTime: Date | null
    readonly endTime: Date | null
    readonly mode: CoopMode
    readonly rule: CoopRule
    readonly bossId: CoopBossInfo.Id | null
    readonly stageId: CoopStage.Id
    readonly rareWeapons: WeaponInfoMain.Id[]
    readonly weaponList: WeaponInfoMain.Id[]

    /**
     * @description
     * Cloudflare KVに書き込むためのユニークキー
     *
     */
    get key(): string {
      // プライベートバイトのスケジュールのKVへの書き込みは許可しない
      if (this.startTime === null || this.endTime === null) {
        throw new Error('Writing to KV for private jobs is not allowed.')
      }
      return `${dayjs(this.startTime).utc().unix()}_${dayjs(this.endTime).utc().unix()}`
    }

    constructor(options: {
      startTime: Date | null
      endTime: Date | null
      mode: CoopMode
      rule: CoopRule
      bossId: CoopBossInfo.Id | null
      stageId: CoopStage.Id
      weaponList: WeaponInfoMain.Id[]
      rareWeapons: WeaponInfoMain.Id[]
    }) {
      this.id = scheduleHash(options)
      this.startTime = options.startTime
      this.endTime = options.endTime
      this.mode = options.mode
      this.rule = options.rule
      this.bossId = options.bossId
      this.stageId = options.stageId
      this.rareWeapons = options.rareWeapons
      this.weaponList = options.weaponList
    }
  }

  export type Query = typeof Query.Type
}
