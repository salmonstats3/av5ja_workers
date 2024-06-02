import { type CoopBossInfo, CoopEnemyInfo } from '@/enums/coop_enemy'
import { CoopEvent } from '@/enums/coop_event'
import type { CoopWaterLevel } from '@/enums/coop_water_level'
import type { WeaponInfoMain } from '@/enums/main'
import { WeaponInfoSpecial } from '@/enums/special'
import type { Species } from '@/enums/species'
import { playerHash, resultHash, waveHash } from '@/utils/hash'
import { Schema as S } from '@effect/schema'
import type { PlayerId, ResultId } from './common.dto'
import { CoopHistoryDetail } from './history_detail'
import { CoopSchedule } from './schedule.dto'

export namespace CoopResult {
  const History = S.Struct({
    schedule: CoopSchedule.Query,
    results: S.Array(CoopHistoryDetail.Query)
  })

  export const Query = S.Struct({
    histories: S.Array(History)
  })

  export class WaveResult {
    readonly waterLevel: CoopWaterLevel.Id
    readonly eventType: CoopEvent.Id
    readonly quotaNum: number | null
    readonly goldenIkuraPopNum: number
    readonly goldenIkuraNum: number | null
    readonly id: number
    readonly isClear: boolean
    readonly hash: string

    constructor(waveResult: CoopHistoryDetail.WaveResult, historyDetail: CoopHistoryDetail.CoopHistoryDetail) {
      const isClear: boolean = (() => {
        const hasDefeatBoss: boolean | null = historyDetail.bossResult?.hasDefeatBoss ?? null
        if (historyDetail.resultWave === -1) {
          return false
        }
        if (hasDefeatBoss !== null) {
          return waveResult.deliverNorm === null ? hasDefeatBoss : true
        }
        return waveResult.waveNumber !== historyDetail.resultWave
      })()
      const hash: string = waveHash({
        uuid: historyDetail.id.uuid,
        playTime: historyDetail.id.playTime,
        id: waveResult.waveNumber
      })
      this.waterLevel = waveResult.waterLevel
      this.eventType = waveResult.eventWave === null ? CoopEvent.Id.WaterLevels : waveResult.eventWave.id
      this.quotaNum = waveResult.deliverNorm
      this.goldenIkuraPopNum = waveResult.goldenPopCount
      this.goldenIkuraNum = waveResult.teamDeliverCount
      this.id = waveResult.waveNumber
      this.isClear = isClear
      this.hash = hash
    }
  }

  export class TextColor {
    readonly a: number
    readonly b: number
    readonly g: number
    readonly r: number
  }

  export class Background {
    readonly textColor: TextColor
    readonly id: number

    constructor(background: CoopHistoryDetail.Background) {
      this.textColor = background.textColor
      this.id = background.id
    }
  }

  export class Nameplate {
    readonly badges: (number | null)[]
    readonly background: Background

    constructor(nameplate: CoopHistoryDetail.Nameplate) {
      this.badges = nameplate.badges.map((badge) => badge?.id ?? null)
      this.background = new Background(nameplate.background)
    }
  }

  export class MemberResult {
    readonly hash: string
    readonly id: PlayerId
    readonly byname: string
    readonly name: string
    readonly nameId: string
    readonly nameplate: Nameplate
    readonly uniform: number
    readonly species: Species
    readonly weaponList: WeaponInfoMain.Id[]
    readonly specialCounts: number[]
    readonly isMyself: boolean
    readonly nplnUserId: string
    readonly specialId: WeaponInfoSpecial.Id | null
    readonly ikuraNum: number
    readonly goldenIkuraNum: number
    readonly goldenIkuraAssistNum: number
    readonly helpCount: number
    readonly deadCount: number
    readonly bossKillCounts: (number | null)[]
    readonly bossKillCountsTotal: number
    readonly jobScore: number | null
    readonly gradeId: number | null
    readonly kumaPoint: number | null
    readonly gradePoint: number | null
    readonly smellMeter: number | null
    readonly jobBonus: number | null
    readonly jobRate: number | null

    constructor(
      memberResult: CoopHistoryDetail.MemberResult,
      waveResults: CoopHistoryDetail.WaveResult[],
      options: {
        isMyself: boolean
        jobScore: number | null
        gradeId: number | null
        kumaPoint: number | null
        gradePoint: number | null
        smellMeter: number | null
        jobBonus: number | null
        jobRate: number | null
        bossKillCounts: (number | null)[]
      } = {
        isMyself: false,
        jobScore: null,
        gradeId: null,
        kumaPoint: null,
        gradePoint: null,
        smellMeter: null,
        jobBonus: null,
        jobRate: null,
        bossKillCounts: [null, null, null, null, null, null, null, null, null, null, null, null, null, null]
      }
    ) {
      this.id = memberResult.player.id
      this.hash = playerHash(memberResult.player.id)
      this.byname = memberResult.player.byname
      this.name = memberResult.player.name
      this.nameId = memberResult.player.nameId
      this.nameplate = new Nameplate(memberResult.player.nameplate)
      this.uniform = memberResult.player.uniform.id
      this.species = memberResult.player.species
      this.weaponList = memberResult.weapons.map((weapon) => weapon.image.url)
      this.specialCounts = waveResults.map(
        (wave) =>
          wave.specialWeapons.map((special) => special.id).filter((id) => id === memberResult.specialWeapon?.weaponId)
            .length
      )
      this.helpCount = memberResult.rescueCount
      this.deadCount = memberResult.rescuedCount
      this.nplnUserId = memberResult.player.id.nplnUserId
      this.specialId = memberResult.specialWeapon?.weaponId ?? WeaponInfoSpecial.Id.RandomGreen
      this.bossKillCounts = options.bossKillCounts
      this.bossKillCountsTotal = memberResult.defeatEnemyCount
      this.ikuraNum = memberResult.deliverCount
      this.goldenIkuraNum = memberResult.goldenDeliverCount
      this.goldenIkuraAssistNum = memberResult.goldenAssistCount
      this.isMyself = options.isMyself
      this.jobScore = options.jobScore
      this.gradeId = options.gradeId
      this.kumaPoint = options.kumaPoint
      this.gradePoint = options.gradePoint
      this.smellMeter = options.smellMeter
      this.jobBonus = options.jobBonus
      this.jobRate = options.jobRate
    }
  }

  export class JobResult {
    readonly failureWave: number | null
    readonly isClear: boolean
    readonly bossId: CoopBossInfo.Id | null
    readonly isBossDefeated: boolean | null

    constructor(options: {
      failureWave: number | null
      isClear: boolean
      bossId: CoopBossInfo.Id | null
      isBossDefeated: boolean | null
    }) {
      this.failureWave = options.failureWave
      this.isClear = options.isClear
      this.bossId = options.bossId
      this.isBossDefeated = options.isBossDefeated
    }
  }

  export class HistoryDetail {
    readonly id: ResultId
    readonly hash: string
    readonly uuid: string
    readonly schedule: CoopSchedule.Response
    readonly scale: (number | null)[]
    readonly myResult: MemberResult
    readonly otherResults: MemberResult[]
    readonly jobResult: JobResult
    readonly playTime: Date
    readonly bossCounts: number[]
    readonly bossKillCounts: number[]
    readonly dangerRate: number
    readonly ikuraNum: number
    readonly goldenIkuraNum: number
    readonly goldenIkuraAssistNum: number
    readonly scenarioCode: string | null
    readonly waveDetails: WaveResult[]

    get key(): string {
      return `${this.id.nplnUserId}_${this.id.playTime.toISOString()}`
    }

    get metadata() {
      return {
        nplnUserId: this.id.nplnUserId,
        playTime: this.id.playTime.toISOString(),
        uuid: this.id.uuid
      }
    }

    constructor(history: { schedule: CoopSchedule.Response; result: CoopHistoryDetail.CoopHistoryDetail }) {
      this.id = history.result.id
      this.hash = resultHash(history.result.id)
      this.uuid = history.result.id.uuid
      this.schedule = history.schedule
      this.scale =
        history.result.scale === null
          ? [null, null, null]
          : [history.result.scale.bronze, history.result.scale.silver, history.result.scale.gold]
      this.playTime = history.result.id.playTime
      this.jobResult = new JobResult({
        failureWave: history.result.resultWave === 0 ? null : history.result.resultWave,
        isClear: history.result.resultWave === 0,
        bossId: history.result.bossResult?.boss.id ?? null,
        isBossDefeated: history.result.bossResult?.hasDefeatBoss ?? null
      })

      const bossCounts: number[] = Object.values(CoopEnemyInfo.Id)
        // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
        .filter((id) => !isNaN(id as number))
        .map((bossId) => history.result.enemyResults.find((result) => result.enemy.id === bossId)?.popCount ?? 0)
      const bossKillCounts: number[] = Object.values(CoopEnemyInfo.Id)
        // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
        .filter((id) => !isNaN(id as number))
        .map((bossId) => history.result.enemyResults.find((result) => result.enemy.id === bossId)?.teamDefeatCount ?? 0)

      this.bossCounts = bossCounts
      this.bossKillCounts = bossKillCounts
      this.dangerRate = history.result.dangerRate
      this.scenarioCode = history.result.scenarioCode
      this.ikuraNum = [history.result.myResult]
        .concat(history.result.memberResults)
        .map((player) => player.deliverCount)
        .reduce((a, b) => a + b, 0)
      this.goldenIkuraNum = history.result.waveResults
        .map((wave) => wave.teamDeliverCount ?? 0)
        .reduce((a, b) => a + b, 0)
      this.goldenIkuraAssistNum = [history.result.myResult]
        .concat(history.result.memberResults)
        .map((player) => player.goldenAssistCount)
        .reduce((a, b) => a + b, 0)
      this.waveDetails = history.result.waveResults.map((waveResult) => new WaveResult(waveResult, history.result))
      // @ts-ignore
      this.myResult = new MemberResult(history.result.myResult, history.result.waveResults, {
        isMyself: true,
        jobScore: history.result.jobScore,
        gradeId: history.result.afterGrade.id,
        kumaPoint: history.result.jobPoint,
        gradePoint: history.result.afterGradePoint,
        smellMeter: history.result.smellMeter,
        jobBonus: history.result.jobBonus,
        jobRate: history.result.jobRate,
        bossKillCounts: Object.values(CoopEnemyInfo.Id)
          // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
          .filter((id) => !isNaN(id as number))
          .map((bossId) => history.result.enemyResults.find((result) => result.enemy.id === bossId)?.defeatCount ?? 0)
      })
      this.otherResults = history.result.memberResults.map(
        // @ts-ignore
        (memberResult) => new MemberResult(memberResult, history.result.waveResults)
      )
    }
  }

  export class CoopHistory {
    readonly schedule: CoopSchedule.Response
    readonly results: HistoryDetail[]

    constructor(history: CoopResult.History) {
      // @ts-ignore
      this.schedule = new CoopSchedule.Response(history.schedule)
      this.results = history.results.map(
        // @ts-ignore
        (result) => new HistoryDetail({ schedule: history.schedule, result: result.data.coopHistoryDetail })
      )
    }
  }

  export class Response {
    readonly histories: CoopResult.CoopHistory[]

    constructor(request: CoopResult.Query) {
      this.histories = request.histories.map((history) => new CoopHistory(history))
    }

    get results(): HistoryDetail[] {
      return this.histories.flatMap((history) => history.results)
    }
  }

  export type History = typeof History.Type
  export type Query = typeof Query.Type
}
