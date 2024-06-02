import { CoopRecord } from '@/models/coop_record.dto'
import { WeaponRecord } from '@/models/weapon_record.dto'
import type { Bindings } from '@/utils/bindings'
import { decode } from '@/utils/decode'
import dayjs from 'dayjs'
import { Effect, Either } from 'effect'
import { Hono } from 'hono'

export const records = new Hono<{ Bindings: Bindings }>()

/**
 * @todo
 * Either.match使いたいけど使い方がよくわかっていない
 */
records.post('/', async (c) => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const body: any = await c.req.json()
  // @ts-ignore
  const result = decode(CoopRecord.Query, body)

  if (Either.isLeft(result)) {
    // @ts-ignore
    throw new HTTPException(400, { message: 'Bad Request', res: c.res, cause: result.left.error.errors })
  }
  if (Either.isRight(result)) {
    // @ts-ignore
    return c.json(new CoopRecord.Response(result.right.data.coopRecord))
  }
})

/**
 * @todo
 * Either.match使いたいけど使い方がよくわかっていない
 */
records.post('/weapons', async (c) => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const body: any = await c.req.json()
  // @ts-ignore
  const result = decode(WeaponRecord.Query, body)

  if (Either.isLeft(result)) {
    // @ts-ignore
    throw new HTTPException(400, { message: 'Bad Request', res: c.res, cause: result.left.error.errors })
  }
  if (Either.isRight(result)) {
    // @ts-ignore
    return c.json(new WeaponRecord.Response(result.right.data.weaponRecords.nodes))
  }
})
