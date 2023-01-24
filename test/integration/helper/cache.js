import { createClient } from 'redis'
import env from '../../../app/env.js'

const { CACHE_HOST, CACHE_PORT, CACHE_PASSWORD } = env

const redisClient = createClient({
  host: CACHE_HOST,
  port: CACHE_PORT,
  ...(CACHE_PASSWORD !== null ? { password: CACHE_PASSWORD } : {}),
})

export const setupCacheClearer = () => {
  before(async function () {
    return new Promise((resolve) => {
      redisClient.flushall(() => resolve())
    })
  })

  after(async function () {
    return new Promise((resolve) => {
      redisClient.flushall(() => resolve())
    })
  })
}
