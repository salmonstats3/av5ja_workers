import { CoopSchedule } from '@/models/schedule.dto'
import type { Bindings } from '@/utils/bindings'
import { decode } from '@/utils/decode'
import dayjs from 'dayjs'
import { Hono } from 'hono'

export const schedules = new Hono<{ Bindings: Bindings }>()

schedules.get('/', async (c) => {
  const keys: string[] = (await c.env.Schedule.list()).keys.map((key) => key.name)
  const schedules = (await Promise.all(keys.map((key) => c.env.Schedule.get(key))))
    .filter((value) => value !== null)
    .map((value) => JSON.parse(value))
    .sort((a, b) => dayjs(b.startTime).utc().unix() - dayjs(a.startTime).utc().unix())
  return c.json({ schedules: schedules })
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
