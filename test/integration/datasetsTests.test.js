import { describe, it, before } from 'mocha'

import { setup as setupClient } from './helper/client.js'
import { assertThingsDatasetsEqual } from './helper/datasets.js'
import data from './helper/data.js'

import clock from './helper/clock.js'
import { setup as setupThings } from './helper/thingsMock.js'
import { setup as setupReadings } from './helper/readingsMock.js'
import { setup as setupUsers } from './helper/usersMock.js'

import allThingsExpectation from './data/thingsTestAllThings.json' assert { type: 'json' }
import allDatasetsExpectation from './data/datasetTestAllDatasets.json' assert { type: 'json' }

const { userLoginCreds } = data
const { mockClock, restoreClock } = clock

const thingsMock = {
  things: allThingsExpectation.map(({ uuid: id, type, ingests, metadata }) => ({
    id,
    type: [...type].reduce((s, c) => {
      if (c === c.toLowerCase()) {
        return `${s}${c}`
      } else {
        return `${s}-${c.toLowerCase()}`
      }
    }, ''),
    metadata,
    ingests,
  })),
  createId: '4081d047-c85f-4d1c-b612-49e8cd04b54F',
}
const readingsMock = {
  things: allDatasetsExpectation,
}
const [adminLogin] = userLoginCreds

describe('dataset tests', function () {
  describe(`list all datasets`, function () {
    const context = { thingsMock, readingsMock }
    setupClient(context)
    mockClock(context)
    setupThings(context)
    setupReadings(context)
    setupUsers(context)

    before(async function () {
      const {
        queries: { getDatasets },
      } = context

      const { data: datasetsData } = await getDatasets(adminLogin.id, {})
      context.result = datasetsData.things
    })

    restoreClock(context)

    it('should create and return a dataset list for each thing', function () {
      assertThingsDatasetsEqual(context.result, allDatasetsExpectation)
    })
  })

  describe(`filter by type`, function () {
    const context = { thingsMock, readingsMock }
    setupClient(context)
    mockClock(context)
    setupThings(context)
    setupReadings(context)
    setupUsers(context)

    before(async function () {
      const {
        queries: { getDatasets },
      } = context

      const { data: datasetsData } = await getDatasets(adminLogin.id, { filter: { types: ['type_0'] } })
      context.result = datasetsData.things
    })

    restoreClock(context)

    it('should create and return a dataset list for each thing', function () {
      const expectation = allDatasetsExpectation.map((thing) => {
        return {
          uuid: thing.uuid,
          datasets: thing.datasets.filter(({ type }) => type === 'type_0'),
        }
      })
      assertThingsDatasetsEqual(context.result, expectation)
    })
  })

  describe(`filter by label`, function () {
    const context = { thingsMock, readingsMock }
    setupClient(context)
    mockClock(context)
    setupThings(context)
    setupReadings(context)
    setupUsers(context)

    before(async function () {
      const {
        queries: { getDatasets },
      } = context

      const { data: datasetsData } = await getDatasets(adminLogin.id, { filter: { labels: ['label_0'] } })
      context.result = datasetsData.things
    })

    restoreClock(context)

    it('should create and return a dataset list for each thing', function () {
      const expectation = allDatasetsExpectation.map((thing) => {
        return {
          uuid: thing.uuid,
          datasets: thing.datasets.filter(({ label }) => label === 'label_0'),
        }
      })
      assertThingsDatasetsEqual(context.result, expectation)
    })
  })

  describe(`filter by type and label`, function () {
    const context = { thingsMock, readingsMock }
    setupClient(context)
    mockClock(context)
    setupThings(context)
    setupReadings(context)
    setupUsers(context)

    before(async function () {
      const {
        queries: { getDatasets },
      } = context

      const { data: datasetsData } = await getDatasets(adminLogin.id, {
        filter: { types: ['type_0'], labels: ['label_0'] },
      })
      context.result = datasetsData.things
    })

    restoreClock(context)

    it('should create and return a dataset list for each thing', function () {
      const expectation = allDatasetsExpectation.map((thing) => {
        return {
          uuid: thing.uuid,
          datasets: thing.datasets.filter(({ type, label }) => label === 'label_0' && type === 'type_0'),
        }
      })
      assertThingsDatasetsEqual(context.result, expectation)
    })
  })
})
