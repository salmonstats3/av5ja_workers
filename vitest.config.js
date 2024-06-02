import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        main: 'src/index.ts',
        wrangler: { configPath: './wrangler.toml' },
        miniflare: {
          kvNamespaces: [{ binding = "Result", id = "4e90622a3c6f4d4eb7480c7b025bea0b", preview_id = "d162c2534873462498aa44c69e98b4ad" }]
        }
      }
    }
  }
})
