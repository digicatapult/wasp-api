import sinon from 'sinon'
import { before, after } from 'mocha'

export default {
  mockClock: (context) => {
    before(function () {
      context.clock = sinon.useFakeTimers()
      context.clock.tick(7 * 24 * 60 * 60 * 1000)
    })
  },
  restoreClock: (context) => {
    after(function () {
      context.clock.restore()
    })
  },
}
