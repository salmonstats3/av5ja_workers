export type CacheMetadata = {
  expiresIn: string
}

export type CacheResult = {
  cache: string | null
  isExpired: boolean
}
