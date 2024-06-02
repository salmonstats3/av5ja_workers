import { Hash2Id, Id2Hash, WeaponInfoMain } from '@/enums/main'
import { Schema as S } from '@effect/schema'
import { type EnumsDefinition, filter } from '@effect/schema/Schema'
import dayjs from 'dayjs'
import { HTTPException } from 'hono/http-exception'

/**
 * @description
 * Nullを許容する
 * @param
 * @returns
 */
export const Nullable = <T extends S.Schema.Any>(self: T): S.NullOr<T> => S.Union(self, S.Null)

/**
 * @description
 * クレデンシャル情報をURLから削除する
 */
export const SafeString = S.transform(S.String, S.String, {
  decode: (input) => {
    const pattern: RegExp = /(.*\/[a-f0-9]{64}_0.png)/g
    const match: RegExpMatchArray | null = input.match(pattern)
    if (match === null) {
      return input
    }
    return match[0]
  },
  encode: (input) => {
    return input
  }
})

/**
 * @description
 * 指定したプレフィックスを持つBase64文字列を数値に変換する
 * @param options
 * @returns
 */
export const IntFromBase64 = (options: { prefix: string }) =>
  S.transform(S.String, S.Number, {
    decode: (input) => {
      const pattern: RegExp = new RegExp(`${options.prefix}-([-0-9]*)$`)
      const match: RegExpMatchArray | null = atob(input).match(pattern)
      if (match === null) {
        return -999
      }
      return Number.parseInt(match[1], 10)
    },
    encode: (input) => {
      return btoa(`${options.prefix}-${input}`)
    }
  })

/**
 * @description
 * URL文字列からハッシュを取得し、ブキIDに変換する
 */
export const WeaponURL = S.transform(S.String, S.Enums(WeaponInfoMain.Id), {
  decode: (input) => {
    const pattern: RegExp = /([a-f0-9]{64})_0.png/
    const match: RegExpMatchArray | null = input.match(pattern)
    if (match === null) {
      return WeaponInfoMain.Id.Dummy
    }
    return Hash2Id(match[1])
  },
  encode: (input) => {
    return Id2Hash(input)
  }
})

/**
 * @description
 * 画像
 * Image->URLをもつ構造体
 */
export const ImageURL = S.Struct({
  image: S.Struct({
    url: WeaponURL
  })
})

/**
 * @description
 * Image->URL, Idをもつ構造体
 * @param options
 * @returns
 */
export const ImageURLId = (options: { prefix: string }) =>
  S.Struct({
    image: S.Struct({
      url: S.String
    }),
    id: IntFromBase64({ prefix: options.prefix })
  })

/**
 * @desciption
 * Base64エンコードされたIdを整数型に変換する構造体
 * @param options
 * @returns
 */
export const IntId = (options: { prefix: string }) =>
  S.Struct({
    id: IntFromBase64({ prefix: options.prefix })
  })

/**
 * @description
 * 文字列がBase64エンコードされているかどうかを検証する
 * @returns
 */
export const Base64Encoded =
  <A extends string>() =>
  <I, R>(self: S.Schema<A, I, R>): filter<S.Schema<A, I, R>> => {
    return self.pipe(filter((a) => btoa(atob(a)) === a))
  }

/**
 * @description
 * Base64デコードされた文字列
 */
export const Base64String = S.transform(S.String, S.String, {
  decode: (input) => {
    return atob(input)
  },
  encode: (input) => {
    return btoa(input)
  }
})

/**
 * @description
 * プレイヤーID
 */
export const PlayerId = S.Struct({
  type: S.String,
  prefix: S.String,
  nplnUserId: S.String,
  playTime: S.DateFromString,
  uuid: S.UUID,
  suffix: S.String,
  hostNplnUserId: S.String
})

/**
 * @description
 * リザルトID
 */
export const ResultId = S.Struct({
  type: S.String,
  prefix: S.String,
  nplnUserId: S.String,
  playTime: S.DateFromString,
  uuid: S.UUID
})

/**
 * @description
 * 文字列をプレイヤーIDに変換する
 */
export const PlayerIdFromString = S.transform(S.String, PlayerId, {
  decode: (input) => {
    const plainText: string = atob(input)
    const pattern: RegExp = /([\w]*)-([\w]{1})-([\w\d]{20}):([\dT]{15})_([a-f0-9-]{36}):([\w]{1})-([\w\d]{20})/
    const match = pattern.exec(plainText)
    if (match === null) {
      throw new HTTPException(400, { message: 'Invalid Result Id' })
    }
    const [, type, prefix, hostNplnUserId, playTime, uuid, suffix, nplnUserId] = match
    return {
      type: type,
      prefix: prefix,
      hostNplnUserId: hostNplnUserId,
      nplnUserId: nplnUserId,
      suffix: suffix,
      playTime: dayjs(playTime).toISOString(),
      uuid: uuid
    }
  },
  encode: (input) => {
    return btoa(
      `${input.type}-${input.prefix}-${input.hostNplnUserId}:${dayjs(input.playTime).format('YYYYMMDDTHHmmss')}_${
        input.uuid
      }:${input.suffix}-${input.nplnUserId}`
    )
  }
})

/**
 * @description
 * 文字列をリザルトIDに変換する
 */
export const ResultIdFromString = S.transform(S.String, ResultId, {
  decode: (input) => {
    const plainText: string = atob(input)
    const pattern: RegExp = /([\w]*)-([\w]{1})-([\w\d]{20}):([\dT]{15})_([a-f0-9-]{36})/
    const match = pattern.exec(plainText)
    if (match === null) {
      throw new HTTPException(400, { message: 'Invalid Result Id' })
    }
    const [, type, prefix, nplnUserId, playTime, uuid] = match
    return {
      type: type,
      prefix: prefix,
      nplnUserId: nplnUserId,
      playTime: dayjs(playTime).toISOString(),
      uuid: uuid
    }
  },
  encode: (input) => {
    const plainText: string = `${input.type}-${input.prefix}-${input.nplnUserId}:${dayjs(input.playTime).format(
      'YYYYMMDDTHHmmss'
    )}_${input.uuid.toLowerCase()}`
    return btoa(plainText)
  },
  strict: true
})

export type PlayerId = typeof PlayerId.Type
export type ResultId = typeof ResultId.Type
