const { AuthenticationError } = require('apollo-server-express')

const authOverride = Symbol('auth-override')

/**
 * @class AuthInvalidError
 * Represents an invalid authentication either because no
 * token was provided or the token provided did not correspond to
 * a valid user
 */
class AuthInvalidError extends AuthenticationError {
  constructor() {
    super('Invalid user')
  }
}

/**
 * @class InsufficientPrivilegesError
 * The role of the user was insufficiently privileged to perform the requested action
 */
class InsufficientPrivilegesError extends AuthenticationError {
  constructor(validRoles, user) {
    super(
      `User has insufficient privileges to perform the requested action. User has role ${user.role}. Action requires role to be one of {${validRoles}}`
    )
  }
}

/**
 * Sets the override flag on the symbol such that a default
 * auth decorator will not override it
 * @param {Function} resolver A GraphQL resolver function
 */
const setAsOverride = (resolver) => {
  const res = (...args) => resolver(...args)
  res[authOverride] = true
  return res
}

/**
 * Decorates a GraphQL resolver to require that the user is one of a set of specified types
 * @param {Function} validRoleSet The Set of roles who can perform the action
 * @param {Function} resolver The GraphQL resolver to apply the permissions check to
 */
const asRole = (validRoleSet) => (resolver) =>
  setAsOverride((parent, args, context, info) => {
    const { user } = context
    if (!validRoleSet.has('unauthenticated')) {
      if (!user) {
        throw new AuthInvalidError()
      }

      if (!validRoleSet.has(user.role)) {
        throw new InsufficientPrivilegesError([...validRoleSet], user)
      }
    }
    return resolver(parent, args, context, info)
  })

/**
 * Decorator to require that a GraphQL resolver can be called by any user
 * @param {Function} resolver The GraphQL resolver to apply the permissions check to
 */
const asUnauthenticated = asRole(new Set(['unauthenticated']))

/**
 * Decorator to require that a GraphQL resolver can be called by either a User or an Admin
 * @param {Function} resolver The GraphQL resolver to apply the permissions check to
 */
const asUserOrAdmin = asRole(new Set(['admin', 'user']))
/**
 * Decorator to require that a GraphQL resolver can be called by an Admin only
 * @param {Function} resolver The GraphQL resolver to apply the permissions check to
 */
const asAdmin = asRole(new Set(['admin']))

/**
 * Applies a permission decorator to all GraphQL resolvers under an Object map
 * of GraphQL types. This is generally used to provide a default accessibility
 * requirement to all GraphQL queries.
 * @param {Object} graphqlTypes GraphQL types object
 */
const setResolverDefault = (graphqlTypes) => (permissionFn) => {
  const transformResolver = ([resolverName, resolver]) => {
    if (!resolver[authOverride] && resolverName !== '__resolveType') return [resolverName, permissionFn(resolver)]
    else return [resolverName, resolver]
  }

  const transformType = ([typeName, resolvers]) => {
    const byResolver = Object.entries(resolvers)
    const byResolverTransformed = byResolver.map(transformResolver)
    return [typeName, Object.fromEntries(byResolverTransformed)]
  }

  const byType = Object.entries(graphqlTypes)
  const byTypeTransformed = byType.map(transformType)
  return Object.fromEntries(byTypeTransformed)
}

module.exports = {
  setResolverDefault,
  asUserOrAdmin,
  asAdmin,
  asUnauthenticated,
  Errors: {
    AuthInvalidError,
    InsufficientPrivilegesError,
  },
}
