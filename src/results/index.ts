import { CoopResult } from '@/models/result.dto'
import type { Bindings } from '@/utils/bindings'
import { decode } from '@/utils/decode'
import { md5 } from '@/utils/hash'
import { Effect, Either } from 'effect'
import { type Context, Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

export const results = new Hono<{ Bindings: Bindings }>()

results.get('/', async (c) => {
  const keys: string[] = (await c.env.Result.list({ limit: 50 })).keys.map((key) => key.name)
  const values: object[] = (await Promise.all(keys.map((key) => c.env.Result.get(key))))
    .filter((value): value is string => value !== null)
    .map((value) => JSON.parse(value))
  return c.json({ results: values })
})

results.get('/:key', async (c) => {
  const nplnUserId: string = c.req.param('key')
  const keys: string[] = (await c.env.Result.list({ prefix: nplnUserId, limit: 50 })).keys.map((key) => key.name)
  const values: object[] = (await Promise.all(keys.map((key) => c.env.Result.get(key))))
    .filter((value): value is string => value !== null)
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
  // 送信されたデータを保存
  c.executionCtx.waitUntil(history(c, body))
  // @ts-ignore
  const result = decode(CoopResult.Query, body)

  if (Either.isLeft(result)) {
    // @ts-ignore
    throw new HTTPException(400, { message: 'Bad Request', res: c.res, cause: result.left.error.errors })
  }
  if (Either.isRight(result)) {
    const data: CoopResult.Response = new CoopResult.Response(result.right)
    // 整形されたデータを保存
    c.executionCtx.waitUntil(store(c, data))
    // @ts-ignore
    return c.json(data)
  }
})

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const history = async (c: Context, body: any): Promise<void> => {
  const key: string = md5(JSON.stringify(body))
  await c.env.History.put(key, JSON.stringify(body))
}

const store = async (c: Context, histories: CoopResult.Response): Promise<void> => {
  await Promise.all(histories.results.map((result) => c.env.Result.put(result.key, JSON.stringify(result))))
}
