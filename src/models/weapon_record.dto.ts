import { Schema as S } from '@effect/schema'

export namespace WeaponRecord {
  const Node = S.Struct({
    specialWeapon: S.Struct({
      image: S.Struct({
        url: S.String
      })
    }),
    image2d: S.Struct({
      url: S.String
    })
  })

  const WeaponRecords = S.Struct({
    nodes: S.Array(Node)
  })

  const Data = S.Struct({
    weaponRecords: WeaponRecords
  })

  export const Query = S.Struct({
    data: Data
  })

  export class Response {
    readonly assetURLs: string[]

    constructor(nodes: WeaponRecord.Node[]) {
      this.assetURLs = nodes.flatMap((node) => [node.specialWeapon.image.url, node.image2d.url])
    }
  }

  export type Node = typeof Node.Type
  export type Query = typeof Query.Type
}
