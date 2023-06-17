import getHostAddress from "./utils/getHostAddress";

const pino = require('pino')
const { build } = require("./app.js");
const path = require('path')

const app = build({
    logger: pino({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        }
      }
    }),
    bodyLimit: 1000 * 1024 * 1024 // Default Limit set to 1000MB
});

(async () => {
    try {             
        await app.ready()
        await app.listen({port: process.env.SERVER_PORT, host: getHostAddress() ? getHostAddress() : hostError()})
        .then(()=>{            
            console.log('[ST-Auth] Server started successfully');
        })
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
})()

function hostError(){
    app.log.error('Unable to get ip address of host');
    process.exit(1);
}