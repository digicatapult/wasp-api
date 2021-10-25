const { describe, it, before } = require('mocha')
const { expect } = require('chai')

const { setup: setupClient } = require('./helper/client')
const { assertThingEqual, assertThingsEqual } = require('./helper/things')
const { mockClock, restoreClock } = require('./helper/clock')
const { setup: setupThings } = require('./helper/thingsMock')
const { setup: setupUsers } = require('./helper/usersMock')
const { userLoginCreds } = require('./helper/data')

const allThingsExpectation = require('./data/thingsTestAllThings')

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
