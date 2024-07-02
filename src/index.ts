import { OpenAPIHono as Hono } from '@hono/zod-openapi'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { cache } from 'hono/cache'
import { cors } from 'hono/cors'
import { csrf } from 'hono/csrf'
import { HTTPException } from 'hono/http-exception'
import { logger } from 'hono/logger'
import { scheduled } from './handler'
import { histories } from './histories'
import { records } from './records'
import { results } from './results'
import { schedules } from './schedules'
import type { Bindings } from './utils/bindings'
import { Discord } from './utils/discord'
import { version } from './version'
import { webhook } from './webhook'

export const app = new Hono<{ Bindings: Bindings }>()

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Tokyo')

app.use(logger())
app.use(csrf())
app.use('*', cors())
// app.use(compress());
app.onError((error, c) => {
  if (error instanceof HTTPException) {
    c.executionCtx.waitUntil(Discord.Logger(c, error))
    return c.json({ message: error.message, description: error.cause }, error.status)
  }
  return c.json({ message: 'Internal Server Error' }, 500)
})

app.route('/v3/schedules', schedules)
app.route('/v3/results', results)
app.route('/v1/histories', histories)
app.route('/v1/records', records)
app.route('/v1/version', version)
app.route('/v1/webhook', webhook)

export default {
  port: 3000,
  fetch: app.fetch,
  scheduled
}
