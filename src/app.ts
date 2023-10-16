// modules
const path = require('path')
require('dotenv').config({path: path.join(__dirname, `../.env`)})
const fastify = require("fastify");

// routes
const pingRoutes = require('./routes/ping')
const userRoutes = require('./routes/user')
const deviceRoutes = require('./routes/device')

// plugins
const { dbPlugin } = require('./plugins/db')
const { corsParams } = require('./plugins/cors')

// options
const dbUrl = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@127.0.0.1:27017/${process.env.DB_NAME}`

export const build = (opts = {}) => {
    const app = fastify(opts)

    app.register(require('@fastify/cors'), corsParams)
    app.register(dbPlugin, { url: dbUrl })
    app.register(require('@fastify/static'), {
      root: path.join(__dirname, 'storage'),
      prefix: '/public/',
    })

    app.register(pingRoutes)
    app.register(userRoutes)
    app.register(deviceRoutes)

    app.after()

  return app;
};