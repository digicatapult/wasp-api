const { before, after } = require('mocha')

const express = require('express')
const bodyParser = require('body-parser')
const { userLoginCreds } = require('./data')

const { USERS_SERVICE_PORT } = require('../../../app/env')

const makeDefaultUsersMock = () => ({
  users: userLoginCreds.map(({ id, username, type, createdAt }) => ({
    id,
    name: username,
    role: type,
    createdAt: new Date(createdAt).toISOString(),
  })),
})

const setupUsersMock = (context) => {
  const usersMock = context.usersMock || makeDefaultUsersMock()
  context.usersMock = usersMock

  before(async function () {
    const app = express()
    app.use(bodyParser.json({ type: 'application/json' }))

    app.get('/v1/user/current', async (req, res) => {
      const userId = req.headers['user-id']
      const user = usersMock.users.find(({ id }) => userId === id)
      if (user) {
        res.status(200).send(user)
        return
      }
      res.status(401).send()
    })

    app.get('/v1/user/:id', async (req, res) => {
      const userId = req.headers['user-id']
      const caller = usersMock.users.find(({ id }) => userId === id)
      if (!caller || caller.role !== 'admin') {
        res.status(401).send()
        return
      }
      const user = usersMock.users.find(({ id }) => id === req.params.id)
      if (!user) {
        res.status(404).send()
        return
      }
      res.status(200).send(user)
    })

    app.get('/v1/user', async (req, res) => {
      const userId = req.headers['user-id']
      const caller = usersMock.users.find(({ id }) => userId === id)
      if (!caller || caller.role !== 'admin') {
        res.status(401).send()
        return
      }
      res.status(200).send(usersMock.users)
    })

    app.post('/v1/user', async (req, res) => {
      const userId = req.headers['user-id']
      const caller = usersMock.users.find(({ id }) => userId === id)
      if (!caller || caller.role !== 'admin') {
        res.status(401).send()
        return
      }

      if (usersMock.newUserError) {
        res.status(usersMock.newUserError.code).send()
        return
      }

      const newUser = {
        ...req.body,
        ...usersMock.newUser,
      }
      usersMock.users.push(newUser)
      res.status(201).send(newUser)
    })

    app.patch('/v1/user/:id', async (req, res) => {
      const userId = req.headers['user-id']
      const caller = usersMock.users.find(({ id }) => userId === id)
      if (!caller || caller.role !== 'admin') {
        res.status(401).send()
        return
      }
      const user = usersMock.users.find(({ id }) => id === req.params.id)
      if (!user) {
        res.status(404).send()
        return
      }
      user.role = req.body.role
      res.status(200).send(user)
    })

    app.put('/v1/user/current/password', async (req, res) => {
      const userId = req.headers['user-id']
      const user = usersMock.users.find(({ id }) => id === userId)

      if (usersMock.updatePasswordError) {
        res.status(400).send({ message: 'Password is just not good enough' })
      }

      user.password = req.body.password
      res.status(200).send(user)
    })

    app.put('/v1/user/:id/password', async (req, res) => {
      const userId = req.headers['user-id']
      const caller = usersMock.users.find(({ id }) => userId === id)
      if (!caller || caller.role !== 'admin') {
        res.status(401).send()
        return
      }
      const user = usersMock.users.find(({ id }) => id === req.params.id)
      if (!user) {
        res.status(404).send()
        return
      }
      user.password = 'wibble'
      res.status(200).send(user)
    })

    await new Promise((resolve, reject) => {
      const server = app.listen(USERS_SERVICE_PORT, (err) => {
        context.usersServer = server
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
      context.usersServer.close((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })
}

module.exports = { setup: setupUsersMock, makeDefaultUsersMock }
