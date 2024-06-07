import type { Env } from 'hono'
import { update } from './schedules'

export async function scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext) {
  ctx.waitUntil(update(event, env, ctx))
}
