import type { CoopBossInfo, CoopEnemyInfo } from '@/enums/coop_enemy'
import type { CoopGrade } from '@/enums/coop_grade'
import type { CoopStage } from '@/enums/coop_stage'
import { CoopTrophy } from '@/enums/coop_trophy'
import { Schema as S } from '@effect/schema'
import { ImageURLId, IntId } from './common.dto'

export namespace CoopRecord {
  export const HighestStageRecord = S.Struct({
    startTime: S.Union(S.DateFromString, S.Undefined),
    endTime: S.Union(S.DateFromString, S.Undefined),
    coopStage: ImageURLId({ prefix: 'CoopStage' }),
    grade: S.Union(IntId({ prefix: 'CoopGrade' }), S.Undefined),
    gradePoint: S.Union(S.Int, S.Undefined, S.Null),
    highestJobScore: S.Union(S.Int, S.Undefined),
    highestGrade: S.Union(IntId({ prefix: 'CoopGrade' }), S.Undefined),
    highestGradePoint: S.Union(S.Int, S.Undefined),
    trophy: S.Union(S.Enums(CoopTrophy), S.Undefined),
    rankPercentile: S.Union(S.Int, S.Undefined, S.Null)
  })

  const DefeatEnemyRecord = S.Struct({
    enemy: ImageURLId({ prefix: 'CoopEnemy' }),
    defeatCount: S.Int
  })

  const Edge = S.Struct({
    node: HighestStageRecord
  })

  const Record = S.Struct({
    edges: S.Array(Edge)
  })

  const BigRunRecord = S.Struct({
    records: Record
  })

  const CoopRecord = S.Struct({
    defeatEnemyRecords: S.Array(DefeatEnemyRecord),
    defeatBossRecords: S.Array(DefeatEnemyRecord),
    stageHighestRecords: S.Array(HighestStageRecord),
    bigRunRecord: BigRunRecord
  })

  const Data = S.Struct({
    coopRecord: CoopRecord
  })

  export const Query = S.Struct({
    data: Data
  })

  export class StageRecord {
    readonly endTime: Date | null
    readonly goldenIkuraNum: number | null
    readonly grade: CoopGrade.Id | null
    readonly gradePoint: number | null
    readonly rank: number | null
    readonly stageId: CoopStage.Id
    readonly startTime: Date | null
    readonly trophy: CoopTrophy | null

    constructor(options: HighestStageRecord) {
      this.endTime = options.endTime ?? null
      this.goldenIkuraNum = options.highestJobScore ?? null
      this.grade = options.grade?.id ?? options.highestGrade?.id ?? null
      this.gradePoint = options.gradePoint ?? options.highestGradePoint ?? null
      this.rank = options.rankPercentile ?? null
      this.stageId = options.coopStage.id
      this.startTime = options.startTime ?? null
      this.trophy = options.trophy ?? null
    }
  }

  export class EnemyRecord {
    readonly count: number
    readonly enemyId: CoopEnemyInfo.Id | CoopBossInfo.Id

    constructor(options: DefeatEnemyRecord) {
      this.count = options.defeatCount
      this.enemyId = options.enemy.id
    }
  }

  export class Response {
    readonly stageRecords: StageRecord[]
    readonly enemyRecords: EnemyRecord[]
    readonly assetURLs: string[]

    /**
     * @todo 要修正箇所
     * @param coopRecord
     */
    constructor(coopRecord: CoopRecord) {
      this.stageRecords = coopRecord.stageHighestRecords
        .concat(coopRecord.bigRunRecord.records.edges.map((edge) => edge.node))
        .map((node) => new StageRecord(node))
      this.enemyRecords = coopRecord.defeatEnemyRecords
        .concat(coopRecord.defeatBossRecords)
        .map((node) => new EnemyRecord(node))
      this.assetURLs = coopRecord.stageHighestRecords
        .concat(coopRecord.bigRunRecord.records.edges.map((edge) => edge.node))
        .filter((node) => node.coopStage.image !== undefined)
        // @ts-ignore
        .map((node) => node.coopStage.image.url)
        .concat(coopRecord.defeatEnemyRecords.concat(coopRecord.defeatBossRecords).map((node) => node.enemy.image.url))
    }
  }

  export type HighestStageRecord = typeof HighestStageRecord.Type
  export type DefeatEnemyRecord = typeof DefeatEnemyRecord.Type
  export type CoopRecord = typeof CoopRecord.Type
  export type Query = typeof Query.Type
}
