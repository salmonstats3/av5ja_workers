export type Bindings = {
  Schedule: KVNamespace
  Result: KVNamespace
  Cache: KVNamespace
  History: KVNamespace
  Status: KVNamespace
  DISCORD_WEBHOOK_URL: string
  DISCORD_WEBHOOK_SUBSCRIBE_URL: string
  STRIPE_WEBHOOK_SECRET: string
  STRIPE_SECRET_KEY: string
}
