import express from 'express'
import cors from 'cors'
import compression from 'compression'
import pinoHttp from 'pino-http'
import { expressMiddleware } from '@apollo/server/express4'

import env from './env.js'
import logger from './logger.js'
import createApolloServer from './apollo.js'

async function createHttpServer() {
  const server = createApolloServer()
  const requestLogger = pinoHttp({ logger })
  const app = express()

  app.use(compression())
  app.use(cors())

  app.use((req, res, next) => {
    if (req.path !== '/health') requestLogger(req, res)
    next()
  })

  await server.start()
  app.use(
    cors(),
    express.json({ limit: env.MAX_QUERY_SIZE }),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    })
  )

  app.get('/health', async (req, res) => {
    res.status(200).send({ status: 'ok' })
  })

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

  const server = app.listen(env.PORT, (err) => {
    if (err) throw new Error('Binding failed: ', err)
    logger.info(`Listening on port ${env.PORT} `)
  })

  setupGracefulExit({ sigName: 'SIGINT', server, exitCode: 0 })
  setupGracefulExit({ sigName: 'SIGTERM', server, exitCode: 143 })
}

export { startServer, createHttpServer }
