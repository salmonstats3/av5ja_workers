import { CoopHistory } from '@/models/history.dto'
import type { Bindings } from '@/utils/bindings'
import { decode } from '@/utils/decode'
import { Console, Effect, Either } from 'effect'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

export const histories = new Hono<{ Bindings: Bindings }>()

/**
 * @todo
 * Either.match使いたいけど使い方がよくわかっていない
 */
histories.post('/', async (c, next) => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const body: any = await c.req.json()
  // @ts-ignore
  const result = decode(CoopHistory.Query, body)

  if (Either.isLeft(result)) {
    // @ts-ignore
    throw new HTTPException(400, { message: 'Bad Request', res: c.res, cause: result.left.error.errors })
  }
  if (Either.isRight(result)) {
    // @ts-ignore
    return c.json(new CoopHistory.Response(result.right.data.coopResult.historyGroups.nodes))
  }
})

histories.patch('/', async (c) => {})
