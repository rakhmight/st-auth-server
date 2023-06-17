import { 
    FastifyInstance, 
    FastifyPluginOptions, 
    FastifyPluginAsync 
} from 'fastify';
import fp from 'fastify-plugin';

const PingRoute: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {

    fastify.get('/api/ping', async (req, rep) => {
        req.log.info(`[ST-Auth] Ping`)
        return rep.code(200).send({statusCode: 200, data: { ok: true, msg: 'Pong!', time: rep.getResponseTime(), server: 'st-auth-server' }})
    })
}

export default fp(PingRoute);