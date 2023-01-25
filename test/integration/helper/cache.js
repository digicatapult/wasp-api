import { createClient } from 'redis'
import env from '../../../app/env.js'

const { CACHE_HOST, CACHE_PORT } = env

const redisClient = createClient({
  url: `redis://default:password@localhost:6379`,
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
