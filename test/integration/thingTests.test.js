import { describe, it, before } from 'mocha'
import { expect } from 'chai'

import { setup as setupClient } from './helper/client.js'
import { assertThingEqual, assertThingsEqual } from './helper/things.js'
import clock from './helper/clock.js'
import { setup as setupThings } from './helper/thingsMock.js'
import { setup as setupUsers } from './helper/usersMock.js'
import data from './helper/data.js'

import allThingsExpectation from './data/thingsTestAllThings.json' assert { type: 'json' }

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
  createId: '4081d047-c85f-4d1c-b612-49e8cd04b54F',
}

const [adminLogin] = userLoginCreds

describe('thing tests', function () {
  describe(`list all things`, function () {
    const context = { thingsMock }
    setupClient(context)
    mockClock(context)
    setupThings(context)
    setupUsers(context)

    before(async function () {
      const {
        queries: { createThing, getThings },
      } = context

      const thingType = 'testThing'
      const ingests = [
        {
          ingest: 'ttn_v2',
          ingestId: '1111111111111111F',
          configuration: {
            devEui: '1111111111111111F',
            otaaAppEui: '22222222222222220',
            otaaAppKey: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaff',
          },
        },
      ]
      await createThing(adminLogin.id, {
        thingType,
        ingests,
      })

      const { data: thingsData } = await getThings(adminLogin.id, {})
      context.result = thingsData.things
    })

    restoreClock(context)

    it('should create and return a things list', function () {
      const allThings = context.result

      // there may be excess data in the things list so filter the ones of the correct appEui
      const testThings = allThings.filter(
        ({ ingests }) => ingests.find(({ configuration }) => configuration.otaaAppEui === '22222222222222220') !== null
      )

      assertThingsEqual(testThings, allThingsExpectation)
    })
  })

  describe(`get thing`, function () {
    const context = { thingsMock }
    setupClient(context)
    mockClock(context)
    setupThings(context)
    setupUsers(context)

    before(async function () {
      const {
        queries: { getThing },
      } = context

      const {
        data: { thing },
      } = await getThing(adminLogin.id, { uuid: allThingsExpectation[4].uuid })
      context.result = thing
    })

    restoreClock(context)

    it('should return things list', function () {
      assertThingEqual(context.result, allThingsExpectation[4])
    })
  })

  describe(`get thing (invalid uuid)`, function () {
    const context = { thingsMock }
    setupClient(context)
    mockClock(context)
    setupThings(context)
    setupUsers(context)

    before(async function () {
      const {
        queries: { getThing },
      } = context

      try {
        const {
          data: { thing },
        } = await getThing(adminLogin.id, { uuid: '00000000-0000-0000-0000-000000000000' })
        context.result = thing
      } catch (err) {
        context.error = err
      }
    })

    restoreClock(context)

    it('should return error', function () {
      expect(context.error.length).to.equal(1)
      expect(context.error[0].message).to.equal('Invalid thing 00000000-0000-0000-0000-000000000000')
    })
  })
})
