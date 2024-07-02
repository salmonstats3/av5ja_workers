import { EventType } from '@/enums/event_type'
import type { Bindings } from '@/utils/bindings'
import { Discord } from '@/utils/discord'
import dayjs from 'dayjs'
import { type Context, Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import Stripe from 'stripe'

export const webhook = new Hono<{ Bindings: Bindings }>()

webhook.post('/', async (c) => {
  const is_verified: boolean = await verify_signature(c)
  return c.json({ verified: is_verified })
})

const get_subscription = async (
  c: Context<{ Bindings: Bindings }>,
  event: Stripe.CheckoutSessionCompletedEvent
): Promise<Stripe.Subscription> => {
  const stripe: Stripe = new Stripe(c.env.STRIPE_SECRET_KEY)
  const subscription: string | Stripe.Subscription | null = event.data.object.subscription
  if (subscription === null) {
    throw new HTTPException(400, { message: 'Bad Request' })
  }
  return await stripe.subscriptions.retrieve(subscription.toString())
}

const activate = async (
  c: Context<{ Bindings: Bindings }>,
  event: Stripe.CheckoutSessionCompletedEvent
): Promise<void> => {
  const npln_user_id: string | null = event.data.object.client_reference_id
  if (npln_user_id === null) {
    return
  }
  const subscription: Stripe.Subscription = await get_subscription(c, event)
  const active: boolean = subscription.status === 'active'
  const period_start: string = dayjs.unix(subscription.current_period_start).toISOString()
  const period_end: string = dayjs.unix(subscription.current_period_end).toISOString()
  const plan: string = subscription.items.data[0].plan.id
  await c.env.Status.put(
    npln_user_id,
    JSON.stringify({
      active: active,
      period_start: period_start,
      period_end: period_end,
      plan: plan
    })
  )
}

const verify_signature = async (c: Context<{ Bindings: Bindings }>): Promise<boolean> => {
  const stripe: Stripe = new Stripe(c.env.STRIPE_SECRET_KEY)
  const signature: string | undefined = c.req.header('stripe-signature')
  if (signature === undefined) {
    throw new HTTPException(400, { message: 'Bad Request' })
  }
  const body: string = await c.req.text()
  try {
    const event: Stripe.Event = await stripe.webhooks.constructEventAsync(body, signature, c.env.STRIPE_WEBHOOK_SECRET)
    console.log(event.type)
    switch (event.type) {
      // セッション成功
      case EventType.CHECKOUT_SESSION_COMPLETED:
        c.executionCtx.waitUntil(activate(c, event))
        break
      // サブスクリプションの作成
      case EventType.CUSTOMER_SUBSCRIPTION_CREATED:
        break
      // サブスクリプションの削除
      case EventType.CUSTOMER_SUBSCRIPTION_DELETED:
        break
      // サブスクリプションの更新
      case EventType.CUSTOMER_SUBSCRIPTION_UPDATED:
        c.executionCtx.waitUntil(Discord.Subscribe(c, event))
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
