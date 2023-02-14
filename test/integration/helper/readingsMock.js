import { before, after } from 'mocha'

import express, { json } from 'express'

import env from '../../../app/env.js'

const { READINGS_SERVICE_PORT } = env

const setupReadingsMock = (context) => {
  before(async function () {
    const app = express()
    app.use(json())

    app.get('/v1/thing/:thingId/dataset', async (req, res) => {
      const thing = context.readingsMock.things.find(({ uuid }) => uuid === req.params.thingId)
      if (thing) {
        res.status(200).send(thing.datasets)
      } else {
        res.status(404).send()
      }
    })

    app.get('/v1/thing/:thingId/dataset/:datasetId/reading', async (req, res) => {
      const thing = context.readingsMock.things.find(({ uuid }) => uuid === req.params.thingId)
      const dataset = thing && thing.datasets.find(({ id }) => id === req.params.datasetId)
      if (dataset) {
        const searchSubset = dataset.readings.filter((r) => {
          if (req.query.startDate) {
            const startTimestamp = new Date(req.query.startDate).getTime()
            if (r.timestamp <= startTimestamp) return false
          }
          if (req.query.endDate) {
            const endTimestamp = new Date(req.query.endDate).getTime()
            if (r.timestamp > endTimestamp) return false
          }
          return true
        })

        // dataset readings are stored in the expectation in desc order
        // if sortByTimestamp !== DESC we should sort ascending therefore reverse in place
        if (req.query.sortByTimestamp !== 'DESC') {
          searchSubset.reverse()
        }

        const offset = parseInt(req.query.offset) || 0
        const limit = parseInt(req.query.limit) < 100 ? parseInt(req.query.limit) : 100

        res.status(200).send(searchSubset.slice(offset, offset + limit))
      } else {
        res.status(404).send()
      }
    })

    app.get('/v1/thing/:thingId/dataset/:datasetId/reading_count', async (req, res) => {
      const thing = context.readingsMock.things.find(({ uuid }) => uuid === req.params.thingId)
      const dataset = thing && thing.datasets.find(({ id }) => id === req.params.datasetId)
      if (dataset) {
        const searchSubset = dataset.readings.filter((r) => {
          if (req.query.startDate) {
            const startTimestamp = new Date(req.query.startDate).getTime()
            if (r.timestamp <= startTimestamp) return false
          }
          if (req.query.endDate) {
            const endTimestamp = new Date(req.query.endDate).getTime()
            if (r.timestamp > endTimestamp) return false
          }
          return true
        })

        res.status(200).send({
          label: dataset.label,
          count: searchSubset.length,
        })
      } else {
        res.status(404).send()
      }
    })

    await new Promise((resolve, reject) => {
      const server = app.listen(READINGS_SERVICE_PORT, (err) => {
        context.readingsServer = server
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
      context.readingsServer.close((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })
}

export const setup = setupReadingsMock
