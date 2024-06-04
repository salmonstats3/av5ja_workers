import { unstable_dev } from 'wrangler'
import type { UnstableDevWorker } from 'wrangler'
import { app } from './index'
import { update } from './schedules'
import { Effect, Either } from 'effect'

describe('Cloudflare Workers', async () => {
  let worker: UnstableDevWorker

  // UnstableDevWorkerは起動と停止に時間がかかるためbeforeAllで実行する
  beforeAll(async () => {
    // 読み込むtsファイルを指定
    worker = await unstable_dev('src/index.ts', {
      experimental: {
        disableExperimentalWarning: true
      }
    })
  })

  // afterAllで停止
  afterAll(async () => {
    await worker.stop()
  })

  it('[GET]: VERSION', async () => {
    const res = await app.request('/v1/version', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const body: any = await res.json()
    expect(res.status).toEqual(200)
    expect(body.version).toEqual('2.10.0')
    expect(body.revision).toEqual('6.0.0-9f87c815')
  })
})
