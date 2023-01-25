import { createClient } from 'redis'
import env from '../../../app/env.js'

const { CACHE_HOST, CACHE_PORT, CACHE_PASSWORD } = env

const redisClient = createClient({
  socket: {
    host: CACHE_HOST,
    port: CACHE_PORT,
  },
  ...(CACHE_PASSWORD !== null ? { password: CACHE_PASSWORD } : {}),
})

await redisClient.connect()

export const setupCacheClearer = () => {
  before(async function () {
    await redisClient.flushAll()
  })

  after(async function () {
    await redisClient.flushAll()
  })
}
