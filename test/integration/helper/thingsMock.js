import { before, after } from 'mocha'

import express, { json } from 'express'

import env from '../../../app/env.js'

const { THINGS_SERVICE_PORT } = env

const setupThingsMock = (context) => {
  before(async function () {
    const app = express()
    app.use(json())

    app.get('/v1/thing', async (req, res) => {
      res.status(200).send(
        context.thingsMock.things.map(({ id, type, metadata }) => ({
          id,
          type,
          metadata,
        }))
      )
    })

    app.get('/v1/thing/:id', async (req, res) => {
      const thing = context.thingsMock.things.find(({ id }) => id === req.params.id)
      if (thing) {
        const { id, type, metadata } = thing
        const result = { id, type, metadata }
        res.status(200).send(result)
      } else {
        res.status(404).send()
      }
    })

    app.get('/v1/thing/:id/ingest', async (req, res) => {
      const thing = context.thingsMock.things.find(({ id }) => id === req.params.id)
      if (thing) {
        const result = thing.ingests
        res.status(200).send(result)
      } else {
        res.status(404).send()
      }
    })

    app.post('/v1/thing', async (req, res) => {
      if (!req.body.type) {
        res.status(400).send()
      } else {
        res.status(200).send({ id: context.thingsMock.createId })
      }
    })

    app.delete('/v1/thing/:id', async (req, res) => {
      const thing = context.thingsMock.things.find(({ id }) => id === req.params.id)
      if (thing) {
        res.status(204).send()
      } else {
        res.status(404).send()
      }
    })

    app.post('/v1/thing/:id/ingest', async (req, res) => {
      if (!req.body.ingest) {
        res.status(400).send()
      } else {
        res.status(200).send()
      }
    })

    await new Promise((resolve, reject) => {
      const server = app.listen(THINGS_SERVICE_PORT, (err) => {
        context.thingsServer = server
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })

  after(function () {
    return new Promise((resolve, reject) => {
      context.thingsServer.close((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })
}

export const setup = setupThingsMock
