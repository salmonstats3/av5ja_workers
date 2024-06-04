import type { Bindings } from '@/utils/bindings'
import { type Env, Hono } from 'hono'
import * as Http from '@effect/platform/HttpClient'
import { CoopSchedule, ThunderSchedule } from '@/models/schedule.dto'
import { Effect } from 'effect'
import dayjs from 'dayjs'

export const schedules = new Hono<{ Bindings: Bindings }>()

schedules.get('/', async (c) => {
  const keys: string[] = (await c.env.Schedule.list()).keys.map((key) => key.name)
  const schedules = (await Promise.all(keys.map((key) => c.env.Schedule.get(key))))
    .filter((value) => value !== null)
    .map((value) => JSON.parse(value))
    .sort((a, b) => dayjs(b.startTime).utc().unix() - dayjs(a.startTime).utc().unix())
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
