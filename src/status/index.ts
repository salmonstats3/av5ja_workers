import type { Bindings } from '@/utils/bindings'
import { type Context, Hono } from 'hono'

export const status = new Hono<{ Bindings: Bindings }>()

status.get('/', async (c: Context<{ Bindings: Bindings }>) => {
  const keys: string[] = (await c.env.Status.list({ limit: 100 })).keys.map((key) => key.name)
  const values = await Promise.all(keys.map((key) => c.env.Status.get(key, 'text')))
  return c.json({ status: values })
})

status.get('/:npln_user_id', async (c: Context) => {
  const npln_user_id: string = c.req.param('npln_user_id')
  const value = await c.env.Status.get(npln_user_id, 'json')
  return c.json({ status: value })
})
