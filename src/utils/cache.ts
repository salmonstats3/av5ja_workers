import dayjs from 'dayjs'
import type { Context } from 'hono'
import type { Bindings } from './bindings'
import type { CacheMetadata, CacheResult } from './metadata'

export namespace KVCache {
  export const remove = async (c: Context<{ Bindings: Bindings }>): Promise<void> => {
    // console.log('[KV]: REMOVE')
    await c.env.Cache.delete(c.req.url)
  }

  export const get = async (c: Context<{ Bindings: Bindings }>): Promise<CacheResult> => {
    const { value, metadata } = await c.env.Cache.getWithMetadata<CacheMetadata>(c.req.url)
    if (value === null || metadata === null) {
      // console.log('[KV]: ->', 'EXPIRES_IN:', 'NULL', 'VALUE:', 'NULL')
      return {
        cache: null,
        isExpired: true
      }
    }
    // console.log('[KV]: ->', 'EXPIRES_IN:', metadata.expiresIn)
    return {
      cache: value,
      isExpired: dayjs(metadata.expiresIn).unix() < dayjs().unix()
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  export const put = async (c: Context<{ Bindings: Bindings }>, value: any): Promise<void> => {
    const expiresIn: string = dayjs().add(30, 'minute').toISOString()
    // console.log('[KV]: <-', 'EXPIRES_IN:', expiresIn)
    await c.env.Cache.put(c.req.url, JSON.stringify(value), { metadata: { expiresIn: expiresIn } })
  }
}
