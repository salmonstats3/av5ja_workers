import dayjs from 'dayjs'
import type { Context } from 'hono'
import type { HTTPException } from 'hono/http-exception'
import type Stripe from 'stripe'
import type { Bindings } from './bindings'

export namespace Discord {
  export const Subscribe = async (
    c: Context<{ Bindings: Bindings }>,
    event: Stripe.CustomerSubscriptionUpdatedEvent
  ) => {
    const content = {
      embeds: [
        {
          color: 5620992,
          fields: [
            {
              name: 'Id',
              value: event.id,
              inline: false
            },
            {
              name: 'Type',
              value: event.type,
              inline: false
            },
            {
              name: 'StartTime',
              value: dayjs(event.data.object.current_period_start * 1000).toISOString(),
              inline: false
            },
            {
              name: 'EndTime',
              value: dayjs(event.data.object.current_period_end * 1000).toISOString(),
              inline: false
            },
            {
              name: 'Version',
              value: event.api_version,
              inline: true
            },
            {
              name: 'Currency',
              value: event.data.object.currency,
              inline: true
            },
            {
              name: 'Amount',
              value: event.data.object.items.data[0].plan.amount,
              inline: true
            },
            {
              name: 'Active',
              value: event.data.object.items.data[0].plan.active,
              inline: true
            }
          ],
          footer: {
            text: dayjs(event.created * 1000).toISOString()
          }
        }
      ]
    }
    const data: FormData = new FormData()
    data.append('payload_json', JSON.stringify(content))
    await fetch(c.env.DISCORD_WEBHOOK_SUBSCRIBE_URL, {
      body: data,
      method: 'POST'
    })
  }

  export const Logger = async (c: Context<{ Bindings: Bindings }>, exception: HTTPException) => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const body: any = await c.req.json()
    const header = c.req.header
    const content = {
      embeds: [
        {
          color: 5620992,
          fields: [
            {
              name: 'Path',
              value: c.req.path,
              inline: true
            },
            {
              name: 'Status',
              value: exception.status,
              inline: true
            },
            {
              name: 'Errors',
              value: exception.message,
              inline: true
            }
          ],
          footer: {
            text: dayjs().utc().toISOString()
          }
        }
      ]
    }
    const data: FormData = new FormData()
    data.append(
      'file',
      new Blob([JSON.stringify(body)], {
        type: 'application/json'
      }),
      'body.json'
    )
    data.append('payload_json', JSON.stringify(content))
    await fetch(c.env.DISCORD_WEBHOOK_URL, {
      body: data,
      method: 'POST'
    })
  }
}
