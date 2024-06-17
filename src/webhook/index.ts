import type { Bindings } from '@/utils/bindings'
import { type Context, Hono } from 'hono'

export const webhook = new Hono<{ Bindings: Bindings }>()

webhook.post('/', async (c) => {
  verify(c)
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const body: any = await c.req.json()

  return c.json({})
})

const verify = (c: Context<{ Bindings: Bindings }>): boolean => {
  const signature: string = c.req.header('paypal-transmission-sig')
  const timestamp: string = c.req.header('paypal-transmission-time')
  const client_id: string = c.env.PAYPAL_CLIENT_ID
  const algorithm: string = c.req.header('paypal-auth-algo')
  const cert_url: string = c.req.header('paypal-cert-url')
  const transmission_id: string = c.req.header('paypal-transmission-id')

  const public_key: string = atob(signature)
  console.log(public_key)
  return true
}
