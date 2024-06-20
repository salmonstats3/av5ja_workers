import dayjs from 'dayjs'
import type { Context } from 'hono'
import type { HTTPException } from 'hono/http-exception'
import type { Bindings } from './bindings'

export const send_log = async (c: Context<{ Bindings: Bindings }>, exception: HTTPException) => {
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
