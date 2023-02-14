import express from 'express'
import cors from 'cors'
import compression from 'compression'
import pinoHttp from 'pino-http'
import { expressMiddleware } from '@apollo/server/express4'
import { ResolverCacheDataSource } from '@digicatapult/resolver-cache-datasource'
import { KeyvAdapter } from '@apollo/utils.keyvadapter'
import Keyv from 'keyv'
import KeyvRedis from '@keyv/redis'

import buildDataLoaders from './loaders/index.js'
import { users as usersService } from './services/index.js'
import env from './env.js'
import logger from './logger.js'
import createApolloServer from './apollo.js'

const { MAX_QUERY_SIZE, CACHE_USERNAME, CACHE_PASSWORD, CACHE_HOST, CACHE_PORT, CACHE_PREFIX, CACHE_MAX_TTL, PORT } =
  env

async function createHttpServer() {
  const server = createApolloServer()
  const requestLogger = pinoHttp({ logger })
  const app = express()

  app.use(compression())

  app.use((req, res, next) => {
    if (req.path !== '/health') requestLogger(req, res)
    next()
  })

  await server.start()

  app.get('/health', async (req, res) => {
    res.status(200).send({ status: 'ok' })
  })

  app.use(
    cors(),
    express.json({ limit: MAX_QUERY_SIZE }),
    expressMiddleware(server, {
      context: async ({ req }) => {
        let user = null
        try {
          const userId = req.headers['user-id']
          user = await usersService.getCurrentUser(userId)
        } catch (err) {
          user = null
        }

        const loaders = buildDataLoaders()

        const keyVCache = new KeyvAdapter(
          new Keyv({
            store: new KeyvRedis(`redis://${CACHE_USERNAME}:${CACHE_PASSWORD}@${CACHE_HOST}:${CACHE_PORT}`),
            namespace: `${CACHE_PREFIX}_APOLLO_`,
          })
        )

        const dataSources = {
          autoResolver: new ResolverCacheDataSource({
            defaultTTL: CACHE_MAX_TTL,
            cache: keyVCache,
          }),
        }
        return { logger, user, loaders, dataSources }
      },
    })
  )

  app.use((err, req, res, next) => {
    if (!res.headersSent) {
      res.status(err.statusCode || 500).json({ error: { message: err.message } })
    }
    next()
  })

  return { app }
}

async function startServer() {
  const { app } = await createHttpServer()

  const setupGracefulExit = ({ sigName, server, exitCode }) => {
    process.on(sigName, async () => {
      server.close(() => {
        process.exit(exitCode)
      })
    })
  }

  const server = app.listen(PORT, (err) => {
    if (err) throw new Error('Binding failed: ', err)
    logger.info(`Listening on port ${PORT} `)
  })

  setupGracefulExit({ sigName: 'SIGINT', server, exitCode: 0 })
  setupGracefulExit({ sigName: 'SIGTERM', server, exitCode: 143 })
}

export { startServer, createHttpServer }
