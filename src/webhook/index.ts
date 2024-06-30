import { EventType } from '@/enums/event_type'
import type { Bindings } from '@/utils/bindings'
import { Discord } from '@/utils/discord'
import { type Context, Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import Stripe from 'stripe'

export const webhook = new Hono<{ Bindings: Bindings }>()

webhook.post('/', async (c) => {
  const is_verified: boolean = await verify_signature(c)
  return c.json({ verified: is_verified })
})

const verify_signature = async (c: Context<{ Bindings: Bindings }>): Promise<boolean> => {
  const stripe: Stripe = new Stripe(c.env.STRIPE_SECRET_KEY)
  const signature: string | undefined = c.req.header('stripe-signature')
  if (signature === undefined) {
    throw new HTTPException(400, { message: 'Bad Request' })
  }
  const body: string = await c.req.text()
  try {
    const event: Stripe.Event = await stripe.webhooks.constructEventAsync(body, signature, c.env.STRIPE_WEBHOOK_SECRET)
    switch (event.type) {
      // セッション成功
      case EventType.CHECKOUT_SESSION_COMPLETED:
        break
      // サブスクリプションの作成
      case EventType.CUSTOMER_SUBSCRIPTION_CREATED:
        break
      // サブスクリプションの削除
      case EventType.CUSTOMER_SUBSCRIPTION_DELETED:
        break
      // サブスクリプションの更新
      case EventType.CUSTOMER_SUBSCRIPTION_UPDATED:
        Discord.Subscribe(c, event)
        break
      // 支払い失敗
      case EventType.INVOICE_PAYMENT_FAILED:
        break
      // 支払い成功
      case EventType.INVOICE_PAYMENT_SUCCEEDED:
        break
      default:
        break
    }
  } catch (error) {
    throw new HTTPException(400, { message: 'Bad Request' })
  }
  return true
}
