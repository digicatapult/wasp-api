import { describe, it, before } from 'mocha'
import { expect } from 'chai'

import { setup as setupClient } from './helper/client.js'
import { assertReadingsEqual } from './helper/readings.js'
import clock from './helper/clock.js'
import { setup as setupThings } from './helper/thingsMock.js'
import { setup as setupReadings } from './helper/readingsMock.js'
import { setup as setupUsers } from './helper/usersMock.js'
import { setup as setupCacheClearer } from './helper/cache.js'
import data from './helper/data.js'

import allThingsExpectation from './data/thingsTestAllThings.json' assert { type: 'json' }
import allReadingsExpectation from './data/readingTestSingleDataset.json' assert { type: 'json' }
import allThingReadingsCount from './data/readingsThingCount.json' assert { type: 'json' }
import allReadingsCount from './data/readingsCountData.json' assert { type: 'json' }
import allReadingsCountExpectation from './data/readingsCount.json' assert { type: 'json' }

const { mockClock, restoreClock } = clock
const { userLoginCreds } = data

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
}
const readingsMock = {
  things: allReadingsExpectation,
}
const readingsCountThingMock = {
  things: allThingReadingsCount,
}
const readingsCountMock = {
  things: allReadingsCount,
}

const thingId = '4081d047-c85f-4d1c-b612-49e8cd04b540'
const [adminLogin] = userLoginCreds

describe('readings tests', function () {
  describe(`get all readings`, function () {
    const context = { thingsMock, readingsMock }
    setupClient(context)
    mockClock(context)
    setupThings(context)
    setupReadings(context)
    setupUsers(context)
    setupCacheClearer()

    before(async function () {
      const {
        queries: { getReadings },
      } = context

      const { data: readingsData } = await getReadings(adminLogin.id, { thingId })
      context.result = readingsData.thing
    })

    restoreClock(context)

    it('should return all readings', function () {
      const readings = context.result.datasets[0].readings
      const expectation = allReadingsExpectation[0].datasets[0].readings
      assertReadingsEqual(readings, expectation)
    })
  })

  describe(`get readings (limit less than reading service limit)`, function () {
    const context = { thingsMock, readingsMock }
    setupClient(context)
    mockClock(context)
    setupThings(context)
    setupReadings(context)
    setupUsers(context)
    setupCacheClearer()

    before(async function () {
      const {
        queries: { getReadings },
      } = context

      const { data: readingsData } = await getReadings(adminLogin.id, { thingId, filter: { limit: 50 } })
      context.result = readingsData.thing
    })

    restoreClock(context)

    it('should return first 50 readings', function () {
      const readings = context.result.datasets[0].readings
      const expectation = allReadingsExpectation[0].datasets[0].readings.slice(0, 50)
      assertReadingsEqual(readings, expectation)
    })
  })

  describe(`get readings (limit greater than reading service limit)`, function () {
    const context = { thingsMock, readingsMock }
    setupClient(context)
    mockClock(context)
    setupThings(context)
    setupReadings(context)
    setupUsers(context)
    setupCacheClearer()

    before(async function () {
      const {
        queries: { getReadings },
      } = context

      const { data: readingsData } = await getReadings(adminLogin.id, { thingId, filter: { limit: 150 } })
      context.result = readingsData.thing
    })

    restoreClock(context)

    it('should return first 150 readings', function () {
      const readings = context.result.datasets[0].readings
      const expectation = allReadingsExpectation[0].datasets[0].readings.slice(0, 150)
      assertReadingsEqual(readings, expectation)
    })
  })

  describe(`get readings (search with start and end timestamp)`, function () {
    const startTimestamp = 1609461000000 // 2021-01-01T00:30:00.000Z
    const endTimestamp = 1609462800000 // 2021-01-01T01:00:00.000Z

    const context = { thingsMock, readingsMock }
    setupClient(context)
    mockClock(context)
    setupThings(context)
    setupReadings(context)
    setupUsers(context)
    setupCacheClearer()

    before(async function () {
      const {
        queries: { getReadings },
      } = context

      const { data: readingsData } = await getReadings(adminLogin.id, {
        thingId,
        filter: { startTimestamp, endTimestamp },
      })
      context.result = readingsData.thing
    })

    restoreClock(context)

    it('should return filtered readings', function () {
      const readings = context.result.datasets[0].readings

      const expectationStartIndex = allReadingsExpectation[0].datasets[0].readings.findIndex(
        (r) => r.timestamp === endTimestamp // expectation is sorted DESC to the start index is of the last timestamp
      )
      const expectationEndIndex = allReadingsExpectation[0].datasets[0].readings.findIndex(
        (r) => r.timestamp === startTimestamp // expectation is sorted DESC to the end index is of the first timestamp
      )

      const expectation = allReadingsExpectation[0].datasets[0].readings.slice(
        expectationStartIndex,
        expectationEndIndex
      )
      assertReadingsEqual(readings, expectation)
    })
  })

  describe(`get readings error (limit < 1)`, function () {
    const context = { thingsMock, readingsMock }
    setupClient(context)
    mockClock(context)
    setupThings(context)
    setupReadings(context)
    setupUsers(context)
    setupCacheClearer()

    before(async function () {
      const {
        queries: { getReadings },
      } = context
      try {
        const { data: readingsData } = await getReadings(adminLogin.id, { thingId, filter: { limit: 0 } })
        context.result = readingsData.thing
      } catch (err) {
        context.error = err
      }
    })

    restoreClock(context)

    it('should error', function () {
      expect(context.error).to.deep.equal([
        {
          message: 'Invalid value for argument limit. 0 is less than 1',
          extensions: { code: 'BAD_USER_INPUT' },
        },
      ])
    })
  })

  describe(`get readings error (limit > 100000)`, function () {
    const context = { thingsMock, readingsMock }
    setupClient(context)
    mockClock(context)
    setupThings(context)
    setupReadings(context)
    setupUsers(context)
    setupCacheClearer()

    before(async function () {
      const {
        queries: { getReadings },
      } = context

      try {
        const { data: readingsData } = await getReadings(adminLogin.id, { thingId, filter: { limit: 100001 } })
        context.result = readingsData.thing
      } catch (err) {
        context.error = err
      }
    })

    restoreClock(context)

    it('should error', function () {
      expect(context.error).to.deep.equal([
        {
          message: 'Invalid value for argument limit. 100001 is greater than 100000',
          extensions: { code: 'BAD_USER_INPUT' },
        },
      ])
    })
  })

  describe(`get all readings counts (search with start and end timestamp)`, function () {
    const startTimestamp = 1616457600000 // 2021-03-23 00:00:00.000000
    const endTimestamp = 1616458150000 // 2021-03-23 00:09:10.000000
    const context = {
      thingsMock: readingsCountThingMock,
      readingsMock: readingsCountMock,
    }
    setupClient(context)
    mockClock(context)
    setupThings(context)
    setupReadings(context)
    setupUsers(context)
    setupCacheClearer()

    before(async function () {
      const {
        queries: { getReadingsCount },
      } = context

      const { data: readingsData } = await getReadingsCount(adminLogin.id, {
        thingId,
        filter: { startTimestamp, endTimestamp },
      })
      context.result = readingsData.thing
    })

    restoreClock(context)

    it('should return all readings counts', function () {
      const datasets = context.result.datasets

      expect(datasets).deep.equal(allReadingsCountExpectation.thing.datasets)
    })
  })

  describe(`get all readings counts (search with start and end timestamp)`, function () {
    const startTimestamp = 1616457600000 // 2021-03-23 00:00:00.000000
    const endTimestamp = 1616458145000 // 2021-03-23 00:09:05.000000
    const context = {
      thingsMock: readingsCountThingMock,
      readingsMock: readingsCountMock,
    }
    setupClient(context)
    mockClock(context)
    setupThings(context)
    setupReadings(context)
    setupUsers(context)
    setupCacheClearer()

    before(async function () {
      const {
        queries: { getReadingsCount },
      } = context

      const { data: readingsData } = await getReadingsCount(adminLogin.id, {
        thingId,
        filter: { startTimestamp, endTimestamp },
      })
      context.result = readingsData.thing
    })

    restoreClock(context)

    it('should return all readings counts', function () {
      const datasets = context.result.datasets

      expect(datasets).deep.equal([
        { label: 'Schneider5111-id1', count: 109 },
        { label: 'Schneider5111-id2', count: 108 },
        { label: 'Schneider5111-id3', count: 109 },
      ])
    })
  })

  describe(`get all readings counts (search with start and end timestamp)`, function () {
    const startTimestamp = 1616457600000 // 2021-03-23 00:00:00.000000
    const endTimestamp = 1616458140000 // 2021-03-23 00:09:00.000000
    const context = {
      thingsMock: readingsCountThingMock,
      readingsMock: readingsCountMock,
    }
    setupClient(context)
    mockClock(context)
    setupThings(context)
    setupReadings(context)
    setupUsers(context)
    setupCacheClearer()

    before(async function () {
      const {
        queries: { getReadingsCount },
      } = context

      const { data: readingsData } = await getReadingsCount(adminLogin.id, {
        thingId,
        filter: { startTimestamp, endTimestamp },
      })
      context.result = readingsData.thing
    })

    restoreClock(context)

    it('should return all readings counts', function () {
      const datasets = context.result.datasets

      expect(datasets).deep.equal([
        { label: 'Schneider5111-id1', count: 108 },
        { label: 'Schneider5111-id2', count: 108 },
        { label: 'Schneider5111-id3', count: 108 },
      ])
    })
  })

  describe(`get all readings counts - empty`, function () {
    const startTimestamp = 1609461000000 // 2021-01-01T00:30:00.000Z
    const endTimestamp = 1609462800000 // 2021-01-01T01:00:00.000Z
    const context = {
      thingsMock: readingsCountThingMock,
      readingsMock: readingsCountMock,
    }
    setupClient(context)
    mockClock(context)
    setupThings(context)
    setupReadings(context)
    setupUsers(context)
    setupCacheClearer()

    before(async function () {
      const {
        queries: { getReadingsCount },
      } = context

      const { data: readingsData } = await getReadingsCount(adminLogin.id, {
        thingId,
        filter: { startTimestamp, endTimestamp },
      })
      context.result = readingsData.thing
    })

    restoreClock(context)

    it('should return all readings counts as 0', function () {
      const datasets = context.result.datasets

      expect(datasets).deep.equal([
        { label: 'Schneider5111-id1', count: 0 },
        { label: 'Schneider5111-id2', count: 0 },
        { label: 'Schneider5111-id3', count: 0 },
      ])
    })
  })

  describe(`get all readings counts - timestamps as 0`, function () {
    const startTimestamp = 0
    const endTimestamp = 0

    const context = {
      thingsMock: readingsCountThingMock,
      readingsMock: readingsCountMock,
    }
    setupClient(context)
    mockClock(context)
    setupThings(context)
    setupReadings(context)
    setupUsers(context)
    setupCacheClearer()

    before(async function () {
      const {
        queries: { getReadingsCount },
      } = context

      const { data: readingsData } = await getReadingsCount(adminLogin.id, {
        thingId,
        filter: { startTimestamp, endTimestamp },
      })
      context.result = readingsData.thing
    })

    restoreClock(context)

    it('should return all readings counts as 0', function () {
      const datasets = context.result.datasets

      expect(datasets).deep.equal([
        { label: 'Schneider5111-id1', count: 0 },
        { label: 'Schneider5111-id2', count: 0 },
        { label: 'Schneider5111-id3', count: 0 },
      ])
    })
  })

  describe(`get all readings counts - null timestamps`, function () {
    const startTimestamp = null
    const endTimestamp = null

    const context = {
      thingsMock: readingsCountThingMock,
      readingsMock: readingsCountMock,
    }
    setupClient(context)
    mockClock(context)
    setupThings(context)
    setupReadings(context)
    setupUsers(context)
    setupCacheClearer()

    before(async function () {
      const {
        queries: { getReadingsCount },
      } = context

      const { data: readingsData } = await getReadingsCount(adminLogin.id, {
        thingId,
        filter: { startTimestamp, endTimestamp },
      })
      context.result = readingsData.thing
    })

    restoreClock(context)

    it('should return all readings counts as 0', function () {
      const datasets = context.result.datasets

      expect(datasets).deep.equal([
        { label: 'Schneider5111-id1', count: 111 },
        { label: 'Schneider5111-id2', count: 109 },
        { label: 'Schneider5111-id3', count: 110 },
      ])
    })
  })

  describe(`get all readings counts - empty filter`, function () {
    const context = {
      thingsMock: readingsCountThingMock,
      readingsMock: readingsCountMock,
    }
    setupClient(context)
    mockClock(context)
    setupThings(context)
    setupReadings(context)
    setupUsers(context)
    setupCacheClearer()

    before(async function () {
      const {
        queries: { getReadingsCount },
      } = context

      const { data: readingsData } = await getReadingsCount(adminLogin.id, {
        thingId,
        filter: {},
      })

      context.result = readingsData.thing
    })

    restoreClock(context)

    it('should return all readings counts as 0', function () {
      const datasets = context.result.datasets

      expect(datasets).deep.equal([
        { label: 'Schneider5111-id1', count: 111 },
        { label: 'Schneider5111-id2', count: 109 },
        { label: 'Schneider5111-id3', count: 110 },
      ])
    })
  })

  describe(`get all readings counts - missing filter`, function () {
    const context = {
      thingsMock: readingsCountThingMock,
      readingsMock: readingsCountMock,
    }
    setupClient(context)
    mockClock(context)
    setupThings(context)
    setupReadings(context)
    setupUsers(context)
    setupCacheClearer()

    before(async function () {
      const {
        queries: { getReadingsCount },
      } = context

      const { data: readingsData } = await getReadingsCount(adminLogin.id, {
        thingId,
      })

      context.result = readingsData.thing
    })

    restoreClock(context)

    it('should return all readings counts as 0', function () {
      const datasets = context.result.datasets

      expect(datasets).deep.equal([
        { label: 'Schneider5111-id1', count: 111 },
        { label: 'Schneider5111-id2', count: 109 },
        { label: 'Schneider5111-id3', count: 110 },
      ])
    })
  })
})
