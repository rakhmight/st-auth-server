import { getSysDate } from "../utils/getSysDate"

const pino = require('pino')
const path = require('path')

const transport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      options: {
        destination: path.join(__dirname, `../logs/auth-logs-${getSysDate()}.log`),
      }
    },
    {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  ]
})

export const fastifyConfig = {
    logger: pino(
      transport
    ),
    bodyLimit: 5000 * 1024 * 1024 // Default Limit set to 5000MB
}