import { Bindings } from '@/utils/bindings'
import { Hono } from 'hono'

export const webhook = new Hono<{ Bindings: Bindings }>()

webhook.post('/', async (c) => {
  const body: any = await c.req.json()
  console.log(body)
  return c.json({})
})
