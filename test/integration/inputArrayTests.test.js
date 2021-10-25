const { describe, it, before } = require('mocha')
const { expect } = require('chai')

const { setup: setupClient } = require('./helper/client')
const { mockClock, restoreClock } = require('./helper/clock')
const { userLoginCreds } = require('./helper/data')

const [adminLogin] = userLoginCreds

const mkInputArraySizeTest = ({ description, query, variables, maxElements, suppliedElements, argumentName }) => {
  describe(description, function () {
    const context = {}
    setupClient(context)
    mockClock(context)

    before(async function () {
      const { client } = context

      try {
        await client.query({
          userId: adminLogin.id,
          query,
          variables,
        })
      } catch (err) {
        context.errors = err
      }
    })

    restoreClock(context)

    it('should error', function () {
      const errors = context.errors
      expect(errors).to.deep.equal([
        {
          message: `Invalid array length for argument ${argumentName}. Supplied ${suppliedElements} items, maximum allowed is ${maxElements}`,
          extensions: { code: 'BAD_USER_INPUT' },
        },
      ])
    })
  })
}

describe('Input array size limit tests', function () {
  mkInputArraySizeTest({
    description: 'DatasetsFilterInput types',
    query: `
      query($types: [String!]!) {
        things {
          uuid
          datasets(filter: {
            types: $types
          }) {
            type
          }
        }
      }
    `,
    variables: {
      types: Array(11)
        .fill(null)
        .map(() => 'a'),
    },
    argumentName: 'types',
    maxElements: 10,
    suppliedElements: 11,
  })

  mkInputArraySizeTest({
    description: 'DatasetsFilterInput labels',
    query: `
      query($labels: [String!]!) {
        things {
          uuid
          datasets(filter: {
            labels: $labels
          }) {
            type
          }
        }
      }
    `,
    variables: {
      labels: Array(11)
        .fill(null)
        .map(() => 'a'),
    },
    argumentName: 'labels',
    maxElements: 10,
    suppliedElements: 11,
  })
})
