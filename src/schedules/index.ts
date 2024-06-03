import type { Bindings } from '@/utils/bindings'
import { Hono } from 'hono'
import response from './schedules.json'
import type { HttpClientError } from '@effect/platform/Http/ClientError'
import * as Http from '@effect/platform/HttpClient'
import { ThunderSchedule } from '@/models/schedule.dto'
import type { ParseError } from '@effect/schema/ParseResult'
import { Effect } from 'effect'

export const schedules = new Hono<{ Bindings: Bindings }>()

schedules.get('/', async (c) => {
  // const keys: string[] = (await c.env.Schedule.list()).keys.map((key) => key.name)
  // const schedules = (await Promise.all(keys.map((key) => c.env.Schedule.get(key))))
  //   .filter((value) => value !== null)
  //   .map((value) => JSON.parse(value))
  //   .sort((a, b) => dayjs(b.startTime).utc().unix() - dayjs(a.startTime).utc().unix())
  // return c.json({ schedules: schedules })
  return c.json(response)
})

export const update = async () => {}

const getSchedules = (): Effect.Effect<ThunderSchedule.Query, HttpClientError | ParseError> => {
  const url: URL = new URL('https://splatoon.oatmealdome.me/api/v1/three/coop/phases?startsAfter=2024-05-01&count=5')
  return Http.request
    .get(url)
    .pipe(Http.client.fetchOk, Effect.andThen(Http.response.schemaBodyJson(ThunderSchedule.Query)), Effect.scoped)
}

schedules.patch('/', async (c) => {
  /// リザルト書き込み
  const result: ThunderSchedule.Query = await Effect.runPromise(getSchedules())
  console.log(result)
  return c.json(result)
})
// schedules.post('/', async (c) => {
//   const body: any = await c.req.json()

//   // @ts-ignore
//   const result = decode(CoopSchedule.Data, body)
//   return c.json({})
// })

// schedules.patch('/', async (c) => {
//   /// リザルト書き込み
//   const result: ScheduleDto[] = await getSchedules()
//   await Promise.all(result.map((schedule) => c.env.Schedule.put(schedule.key, JSON.stringify(schedule))))
//   return c.json({ message: 'Schedules updated.' })
// })
