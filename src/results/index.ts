import { CoopResult } from '@/models/result.dto'
import type { Bindings } from '@/utils/bindings'
import { decode } from '@/utils/decode'
import { Effect, Either } from 'effect'
import { Hono } from 'hono'

export const results = new Hono<{ Bindings: Bindings }>()

results.get('/', async (c) => {
  const keys: string[] = (await c.env.Result.list()).keys.map((key) => key.name)
  const values: object[] = (await Promise.all(keys.map((key) => c.env.Result.get(key))))
    .filter((value) => value !== null)
    .map((value) => JSON.parse(value))
  return c.json({ results: values })
})

results.get('/:key', async (c) => {
  const nplnUserId: string = c.req.param('key')
  const keys: string[] = (await c.env.Result.list({ prefix: nplnUserId })).keys.map((key) => key.name)
  const values: object[] = (await Promise.all(keys.map((key) => c.env.Result.get(key))))
    .filter((value) => value !== null)
    .map((value) => JSON.parse(value))
  return c.json({ results: values })
})

/**
 * @todo
 * Either.match使いたいけど使い方がよくわかっていない
 */
results.post('/', async (c) => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const body: any = await c.req.json()
  // @ts-ignore
  const result = decode(CoopResult.Query, body)

  if (Either.isLeft(result)) {
    // @ts-ignore
    throw new HTTPException(400, { message: 'Bad Request', res: c.res, cause: result.left.error.errors })
  }
  if (Either.isRight(result)) {
    // @ts-ignore
    return c.json(new CoopResult.Response(result.right))
  }
})
