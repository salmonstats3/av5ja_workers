import type { Bindings } from '@/utils/bindings'
import { Hono } from 'hono'

export const version = new Hono<{ Bindings: Bindings }>()

version.get('/', async (c) => {
  return c.json({ revision: '6.0.0-9f87c815', version: '2.10.0' })
})
