// modules
const path = require('path')
require('dotenv').config({path: path.join(__dirname, `../.env`)})
const fastify = require("fastify");

// routes
const pingRoutes = require('./routes/ping')
const userRoutes = require('./routes/user')
const avatarRoutes = require('./routes/avatar')
const deviceRoutes = require('./routes/device')

// plugins
const { dbPlugin } = require('./plugins/db')
const { corsParams } = require('./plugins/cors')

// options
const dbUrl = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@localhost:27017/${process.env.DB_NAME}`

export const build = (opts = {}) => {
    const app = fastify(opts)

    app.register(require('@fastify/cors'), corsParams)
    app.register(dbPlugin, { url: dbUrl })

    app.register(pingRoutes)
    app.register(userRoutes)
    app.register(avatarRoutes)
    app.register(deviceRoutes)

    app.after()

  return app;
};