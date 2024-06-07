import { CoopRule } from '@/enums/coop_rule'
import { CoopWaterLevel } from '@/enums/coop_water_level'
import { WeaponInfoSpecial } from '@/enums/special'
import { Species } from '@/enums/species'
import { Schema as S } from '@effect/schema'
import {
  ImageURL,
  IntFromBase64,
  IntId,
  Nullable,
  PlayerIdFromString,
  ResultId,
  ResultIdFromString
} from './common.dto'

export namespace CoopHistoryDetail {
  const Background = S.Struct({
    textColor: S.Struct({
      a: S.Number,
      b: S.Number,
      g: S.Number,
      r: S.Number
    }),
    id: IntFromBase64({ prefix: 'NameplateBackground' })
  })

  const Nameplate = S.Struct({
    badges: S.Array(Nullable(IntId({ prefix: 'Badge' }))),
    background: Background
  })

  const Player = S.Struct({
    byname: S.String,
    name: S.String,
    nameId: S.String,
    nameplate: Nameplate,
    uniform: IntId({ prefix: 'CoopUniform' }),
    id: PlayerIdFromString,
    species: S.Enums(Species)
  })

  const MemberResult = S.Struct({
    player: Player,
    weapons: S.Array(ImageURL),
    defeatEnemyCount: S.Int,
    deliverCount: S.Int,
    goldenAssistCount: S.Int,
    goldenDeliverCount: S.Int,
    rescueCount: S.Int,
    rescuedCount: S.Int,
    specialWeapon: Nullable(
      S.Struct({
        weaponId: S.Enums(WeaponInfoSpecial.Id)
      })
    )
  })

  const BossResult = S.Struct({
    hasDefeatBoss: S.Boolean,
    boss: IntId({ prefix: 'CoopEnemy' })
  })

  const EnemyResult = S.Struct({
    defeatCount: S.Int,
    teamDefeatCount: S.Int,
    popCount: S.Int,
    enemy: IntId({ prefix: 'CoopEnemy' })
  })

  const WaveResult = S.Struct({
    waveNumber: S.Int,
    eventWave: Nullable(IntId({ prefix: 'CoopEventWave' })),
    waterLevel: S.Enums(CoopWaterLevel.Id),
    deliverNorm: Nullable(S.Int),
    goldenPopCount: S.Int,
    teamDeliverCount: Nullable(S.Int),
    specialWeapons: S.Array(IntId({ prefix: 'SpecialWeapon' }))
  })

  const HistoryDetailId = S.Struct({
    id: ResultIdFromString
  })

  const Scale = S.Struct({
    gold: S.Int,
    silver: S.Int,
    bronze: S.Int
  })

  export const CoopHistoryDetail = S.Struct({
    id: ResultIdFromString,
    afterGrade: Nullable(IntId({ prefix: 'CoopGrade' })),
    myResult: MemberResult,
    memberResults: S.Array(MemberResult),
    bossResult: Nullable(BossResult),
    bossResults: Nullable(S.Array(BossResult)),
    enemyResults: S.Array(EnemyResult),
    waveResults: S.Array(WaveResult),
    resultWave: S.Int,
    playedTime: S.String,
    rule: S.Enums(CoopRule),
    coopStage: IntId({ prefix: 'CoopStage' }),
    dangerRate: S.Number,
    scenarioCode: Nullable(S.String),
    smellMeter: Nullable(S.Int),
    weapons: S.Array(ImageURL),
    boss: Nullable(IntId({ prefix: 'CoopEnemy' })),
    afterGradePoint: Nullable(S.Int),
    scale: Nullable(Scale),
    jobPoint: Nullable(S.Int),
    jobScore: Nullable(S.Int),
    jobRate: Nullable(S.Number),
    jobBonus: Nullable(S.Int),
    nextHistoryDetail: Nullable(HistoryDetailId),
    previousHistoryDetail: Nullable(HistoryDetailId)
  })

  const Data = S.Struct({
    coopHistoryDetail: CoopHistoryDetail
  })

  export const Query = S.Struct({
    data: Data
  })

  export type BossResult = typeof BossResult.Type
  export type HistoryDetail = typeof CoopHistoryDetail.Type
  export type WaveResult = typeof WaveResult.Type
  export type MemberResult = typeof MemberResult.Type
  export type Nameplate = typeof Nameplate.Type
  export type Background = typeof Background.Type
  export type CoopHistoryDetail = typeof CoopHistoryDetail.Type
}
