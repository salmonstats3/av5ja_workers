import { CoopSchedule, ThunderSchedule } from '@/models/schedule.dto'
import type { Bindings } from '@/utils/bindings'
import { KVCache } from '@/utils/cache'
import * as Http from '@effect/platform/HttpClient'
import dayjs, { Dayjs } from 'dayjs'
import { Effect } from 'effect'
import { type Context, type Env, Hono } from 'hono'

export const schedules = new Hono<{ Bindings: Bindings }>()

const store = async (c: Context<{ Bindings: Bindings }>): Promise<CoopSchedule.Response[]> => {
  console.log('[CACHE]: FETCH')
  const keys: string[] = (await c.env.Schedule.list()).keys.map((key) => key.name)
  const schedules: CoopSchedule.Response[] = (await Promise.all(keys.map((key) => c.env.Schedule.get(key))))
    .filter((value) => value !== null)
    .map((value) => JSON.parse(value))
    .sort((a, b) => dayjs(b.startTime).utc().unix() - dayjs(a.startTime).utc().unix())
  await KVCache.put(c, schedules)
  return schedules
}

schedules.get('/', async (c) => {
  const { cache, isExpired } = await KVCache.get(c)
  if (isExpired) {
    console.log('[CACHE]: EXPIRED/MISS')
    c.executionCtx.waitUntil(store(c))
  }
  if (cache !== null) {
    console.log('[CACHE]: HIT')
    return c.json({ schedules: JSON.parse(cache) })
  }
  // 最初の一回だけここが実行される
  const schedules: CoopSchedule.Response[] = await store(c)
  return c.json({ schedules: schedules })
})

/**
 * @todo
 * エラー時の処理を書くこと
 * @returns
 */
export const update = async (controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<boolean> => {
  // const url: URL = new URL('https://splatoon.oatmealdome.me/api/v1/three/coop/phases?startsAfter=2024-05-01&count=5')
  const url: URL = new URL('https://splatoon.oatmealdome.me/api/v1/three/coop/phases?count=5')
  const request = Http.request
    .get(url)
    .pipe(Http.client.fetchOk, Effect.andThen(Http.response.schemaBodyJson(ThunderSchedule.Query)), Effect.scoped)
    .pipe(Effect.map((result) => CoopSchedule.Response.from(result)))
  const schedules: CoopSchedule.Response[] = await Effect.runPromise(request)
  // @ts-ignore
  await Promise.all(schedules.map((schedule) => env.Schedule.put(schedule.key, JSON.stringify(schedule))))
  return true
}
