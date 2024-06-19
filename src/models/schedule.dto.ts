import { createHash } from 'node:crypto'
import { CoopBossInfo } from '@/enums/coop_enemy'
import { CoopMode } from '@/enums/coop_mode'
import { CoopRule } from '@/enums/coop_rule'
import { CoopStage } from '@/enums/coop_stage'
import { WeaponInfoMain } from '@/enums/main'
import { scheduleHash } from '@/utils/hash'
import { Schema as S } from '@effect/schema'
import dayjs from 'dayjs'
import { ISO8601String, ImageURLId, IntFromBase64, Nullable } from './common.dto'

export namespace ThunderSchedule {
  const BossId = S.transform(S.Union(S.String, S.Undefined), Nullable(S.Enums(CoopBossInfo.Id)), {
    decode: (input) => {
      switch (input) {
        case 'SakelienGiant':
          return CoopBossInfo.Id.SakelienGiant
        case 'SakeRope':
          return CoopBossInfo.Id.SakeRope
        case 'SakeJaw':
          return CoopBossInfo.Id.SakeJaw
        case 'Random':
          return CoopBossInfo.Id.Random
        case 'Triple':
          return CoopBossInfo.Id.Triple
        default:
          return null
      }
    },
    encode: (input) => {
      switch (input) {
        case CoopBossInfo.Id.SakelienGiant:
          return 'SakelienGiant'
        case CoopBossInfo.Id.SakeRope:
          return 'SakeRope'
        case CoopBossInfo.Id.SakeJaw:
          return 'SakeJaw'
        case CoopBossInfo.Id.Random:
          return 'Random'
        case CoopBossInfo.Id.Triple:
          return 'Triple'
        default:
          return 'Unknown'
      }
    }
  })

  const Schedule = S.Struct({
    startTime: S.DateFromString,
    endTime: S.DateFromString,
    stageId: S.propertySignature(S.Enums(CoopStage.Id)).pipe(S.fromKey('stage')),
    bossId: S.propertySignature(S.Union(BossId, S.Undefined)).pipe(S.fromKey('bigBoss')),
    // mode: S.Enums(CoopMode),
    // rule: S.Enums(CoopRule)
    weaponList: S.propertySignature(S.Array(S.Enums(WeaponInfoMain.Id))).pipe(S.fromKey('weapons')),
    rareWeapons: S.Array(S.Enums(WeaponInfoMain.Id))
  })

  export const Query = S.Struct({
    Normal: S.Array(Schedule),
    BigRun: S.Array(Schedule),
    TeamContest: S.Array(Schedule)
  })

  export type Query = typeof Query.Type
}

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
    startTime: ISO8601String,
    endTime: ISO8601String,
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
      return `${dayjs(this.startTime).toISOString()}:${dayjs(this.endTime).toISOString()}`
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

    static from(schedule: ThunderSchedule.Query): CoopSchedule.Response[] {
      return [
        schedule.Normal.map(
          // @ts-ignore
          (schedule) => new CoopSchedule.Response({ ...schedule, mode: CoopMode.REGULAR, rule: CoopRule.REGULAR })
        ),
        schedule.BigRun.map(
          // @ts-ignore
          (schedule) => new CoopSchedule.Response({ ...schedule, mode: CoopMode.REGULAR, rule: CoopRule.BIG_RUN })
        ),
        schedule.TeamContest.map(
          // @ts-ignore
          (schedule) => new CoopSchedule.Response({ ...schedule, mode: CoopMode.LIMITED, rule: CoopRule.TEAM_CONTEST })
        )
      ].flat()
    }
  }

  export type Query = typeof Query.Type
}
