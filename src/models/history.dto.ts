import { CoopMode } from '@/enums/coop_mode'
import { CoopRule } from '@/enums/coop_rule'
import type { CoopStage } from '@/enums/coop_stage'
import type { WeaponInfoMain } from '@/enums/main'
import { Schema as S } from '@effect/schema'
import { decodeEither } from '@effect/schema/Schema'
import { ImageURL, ImageURLId, IntId, Nullable, type ResultId, ResultIdFromString } from './common.dto'
import { CoopHistoryDetail } from './history_detail'
import { CoopSchedule } from './schedule.dto'

export namespace CoopHistory {
  export const DetailNode = S.Struct({
    id: ResultIdFromString,
    coopStage: IntId({ prefix: 'CoopStage' }),
    weapons: S.Array(ImageURL)
  })

  const HistoryDetail = S.Struct({
    nodes: S.Array(DetailNode)
  })

  const Node = S.Struct({
    startTime: Nullable(S.DateFromString),
    endTime: Nullable(S.DateFromString),
    mode: S.Enums(CoopMode),
    rule: S.Enums(CoopRule),
    historyDetails: HistoryDetail
  })

  const HistoryGroup = S.Struct({
    nodes: S.Array(Node)
  })

  const CoopResult = S.Struct({
    historyGroups: HistoryGroup
  })

  const Data = S.Struct({
    coopResult: CoopResult
  })

  export const Query = S.Struct({
    data: Data
  })

  export class History {
    readonly schedule: CoopSchedule.Response
    readonly results: ResultId[]

    constructor(historyGroup: Node) {
      const node = historyGroup.historyDetails.nodes[0]
      const stageId: CoopStage.Id = node.coopStage.id
      const weaponList: WeaponInfoMain.Id[] = node.weapons.map((weapon) => weapon.image.url)
      this.schedule = new CoopSchedule.Response({
        startTime: historyGroup.startTime,
        endTime: historyGroup.endTime,
        mode: historyGroup.mode,
        rule: historyGroup.rule,
        bossId: null,
        stageId: stageId,
        weaponList: weaponList,
        rareWeapons: []
      })
      this.results = historyGroup.historyDetails.nodes.map((historyDetail) => historyDetail.id)
    }
  }

  export class Response {
    readonly histories: History[]
    // readonly assetURLs: string[]

    constructor(historyGroups: Node[]) {
      this.histories = historyGroups.map((historyGroup) => new History(historyGroup))
      // this.assetURLs = historyGroups.flatMap((historyGroups) => historyGroups.historyDetails.nodes.flatMap((node) => node.weapons.map((weapon))))
    }
  }

  export type Node = typeof Node.Type
  export type Data = typeof Data.Type
}
