import fetch from 'node-fetch'

import env from '../env.js'
import logger from '../logger.js'

const { USERS_SERVICE_HOST, USERS_SERVICE_PORT } = env
class UsersServiceError extends Error {
  constructor({ code, message }) {
    super(message)
    this.code = code
  }
}

const apiPrefix = `http://${USERS_SERVICE_HOST}:${USERS_SERVICE_PORT}/v1`

const getCurrentUser = async (asUserId) => {
  const url = `${apiPrefix}/user/current`
  const response = await fetch(url, {
    headers: {
      'user-id': asUserId,
    },
  })

  if (!response.ok) {
    logger.warn(
      `Error fetching current user from users service (${url}). Error was (${response.status}) ${response.statusText}`
    )
    throw new UsersServiceError({ code: response.status, message: response.statusText })
  }

  const responseText = await response.text()
  if (responseText) {
    return JSON.parse(responseText)
  }
}

const getUser = async (asUserId, { userId }) => {
  const url = `${apiPrefix}/user/${userId}`
  const response = await fetch(url, {
    headers: {
      'user-id': asUserId,
    },
  })

  if (!response.ok) {
    logger.warn(
      `Error fetching user ${userId} from users service (${url}). Error was (${response.status}) ${response.statusText}`
    )
    throw new UsersServiceError({ code: response.status, message: response.statusText })
  }

  const responseText = await response.text()
  if (responseText) {
    return JSON.parse(responseText)
  }
}

const getUsers = async (asUserId) => {
  const url = `${apiPrefix}/user`
  const response = await fetch(url, {
    headers: {
      'user-id': asUserId,
    },
  })

  if (!response.ok) {
    logger.warn(
      `Error fetching users from users service (${url}). Error was (${response.status}) ${response.statusText}`
    )
    throw new UsersServiceError({ code: response.status, message: response.statusText })
  }

  const responseText = await response.text()
  if (responseText) {
    return JSON.parse(responseText)
  }
}

const createUser = async (asUserId, { name, role }) => {
  const url = `${apiPrefix}/user`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'user-id': asUserId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, role }),
  })

  if (!response.ok) {
    logger.warn(
      `Error creating user (${name}, ${role}) from users service (${url}). Error was (${response.status}) ${response.statusText}`
    )
    throw new UsersServiceError({ code: response.status, message: response.statusText })
  }

  const responseText = await response.text()
  if (responseText) {
    return JSON.parse(responseText)
  }
}

const updateUserPassword = async (asUserId, { password }) => {
  const url = `${apiPrefix}/user/current/password`
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'user-id': asUserId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  })

  if (!response.ok) {
    logger.warn(
      `Error updating password for current user from users service (${url}). Error was (${response.status}) ${response.statusText}`
    )
    if (response.status === 400) {
      const bodyText = await response.text()
      const bodyParsed = JSON.parse(bodyText)
      if (bodyParsed.message) {
        throw new UsersServiceError({ code: response.status, message: bodyParsed.message })
      }
    }
    throw new UsersServiceError({ code: response.status, message: response.statusText })
  }

  const responseText = await response.text()
  if (responseText) {
    return JSON.parse(responseText)
  }
}

const resetUserPassword = async (asUserId, { userId }) => {
  const url = `${apiPrefix}/user/${userId}/password`
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'user-id': asUserId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })

  if (!response.ok) {
    logger.warn(
      `Error updating password for current user from users service (${url}). Error was (${response.status}) ${response.statusText}`
    )
    throw new UsersServiceError({ code: response.status, message: response.statusText })
  }

  const responseText = await response.text()
  if (responseText) {
    return JSON.parse(responseText)
  }
}

const updateUser = async (asUserId, { userId, role }) => {
  const url = `${apiPrefix}/user/${userId}`
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'user-id': asUserId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role }),
  })

  if (!response.ok) {
    logger.warn(
      `Error updating role for current user from users service (${url}). Error was (${response.status}) ${response.statusText}`
    )
    throw new UsersServiceError({ code: response.status, message: response.statusText })
  }

  const responseText = await response.text()
  if (responseText) {
    return JSON.parse(responseText)
  }
}

export default {
  Errors: {
    UsersServiceError,
  },
  getCurrentUser,
  getUser,
  getUsers,
  createUser,
  updateUserPassword,
  resetUserPassword,
  updateUser,
}
