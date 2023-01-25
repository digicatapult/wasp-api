import { createClient } from 'redis'
import env from '../../../app/env.js'

const { CACHE_USERNAME, CACHE_PASSWORD, CACHE_HOST, CACHE_PORT } = env

const redisClient = createClient({
  url: `redis://${CACHE_USERNAME}:${CACHE_PASSWORD}@${CACHE_HOST}:${CACHE_PORT}`,
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
