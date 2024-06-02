import { beforeAll, describe, test } from 'bun:test'
import { Hono } from 'hono'

describe('Histories', () => {
  beforeAll(() => {
    const fetchMock = getMiniflareFetchMock()
    fetchMock.disableNetConnect()
    const origin = fetchMock.get('https://api.splatnet3.com')
    origin.intercept({ method: 'GET', path: 'v1/histories' })
  })

  const app = new Hono()

  test('POST /histories', async () => {
    const response = await app.request('http://localhost:33007/v1/histories')
  })
})
