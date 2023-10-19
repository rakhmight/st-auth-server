import getHostAddress from "./utils/getHostAddress";

const { build } = require("./app.js");
const { fastifyConfig } = require('./configs')

const app = build(fastifyConfig);

(async () => {
    try {             
        await app.ready()
        await app.listen({port: process.env.SERVER_PORT, host: getHostAddress() ? getHostAddress() : hostError()})
        .then(()=>{
            app.log.info({ actor: 'ST-Auth' }, 'Server started successfully')
        })
    } catch (error) {
      app.log.error({ actor: 'ST-Auth' }, (error as Error).message);
        process.exit(1);
    }
})()

function hostError(){
  app.log.error({ actor: 'ST-Auth' }, 'Unable to get ip address of host');
    process.exit(1);
}