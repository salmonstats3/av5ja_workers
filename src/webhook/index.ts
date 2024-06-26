import { createHash, createVerify } from 'node:crypto'
import type { Bindings } from '@/utils/bindings'
import { is } from '@effect/schema/Schema'
import { type Context, Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

export const webhook = new Hono<{ Bindings: Bindings }>()

webhook.post('/', async (c) => {
  await verify(c)
  return c.json({})
})

const get_access_token = async (c: Context<{ Bindings: Bindings }>): Promise<string> => {
  const client_id: string = c.env.PAYPAL_CLIENT_ID
  const client_secret: string = c.env.PAYPAL_CLIENT_SECRET
  const authorization: string = btoa(`${client_id}:${client_secret}`)
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const response: any = await (
    await fetch(`${c.env.PAYPAL_API_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authorization}`
      },
      body: 'grant_type=client_credentials'
    })
  ).json()
  console.log('ACCESS TOKEN', response)
  return response.access_token
}

const verify_signature = async (c: Context<{ Bindings: Bindings }>, access_token: string): Promise<boolean> => {
  const webhook_id: string = c.env.PAYPAL_WEBHOOK_ID
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const payload: any = await c.req.json()
  console.log('PAYLOAD', payload)
  const signature: string | undefined = c.req.header('paypal-transmission-sig')
  const timestamp: string | undefined = c.req.header('paypal-transmission-time')
  const algorithm: string | undefined = c.req.header('paypal-auth-algo')
  const cert_url: string | undefined = c.req.header('paypal-cert-url')
  const transmission_id: string | undefined = c.req.header('paypal-transmission-id')
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const response: any = await fetch(
    `${c.env.PAYPAL_API_URL}/v1/oauth2/token/v1/notifications/verify-webhook-signature`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`
      },
      body: JSON.stringify({
        transmission_id: transmission_id,
        transmission_time: timestamp,
        webhook_id: webhook_id,
        transmission_sig: signature,
        cert_url: cert_url,
        auth_algo: algorithm,
        webhook_event: payload
      })
    }
  )
  console.log(response)
  return response.ok
}

const verify = async (c: Context<{ Bindings: Bindings }>): Promise<boolean> => {
  const access_token = await get_access_token(c)
  const verified = await verify_signature(c, access_token)
  if (!verified) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }
  return verified
}
