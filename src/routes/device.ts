import { 
    FastifyInstance, 
    FastifyPluginOptions, 
    FastifyPluginAsync 
} from 'fastify';
import fp from 'fastify-plugin';
import { DeviceAddReqI } from './@types/device';
import checkToken from '../middleware/checkToken';
import { Device } from '../models/device';
import { Db } from '../plugins/db';
import { CheckedUserCtxI } from './@types/user';
import checkIsAdmin from '../middleware/checkIsAdmin';

// Declaration merging
declare module 'fastify' {
    export interface FastifyInstance {
        db: Db;
    }

    interface FastifyRequest {
        user: CheckedUserCtxI
    }
}

const DeviceRoute: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {

    fastify.post<{Body: DeviceAddReqI}>('/api/device/add', {preHandler: [checkToken, checkIsAdmin]}, async (req, rep) => {
        try {

            const deviceData = req.body.data
    
            const newDevice = await Device.create({
                _id: deviceData.id,
                code: deviceData.code
            })
    
            req.log.info(`[ST-Auth] User ${req.body.auth.id} registered new device`)
            return rep.code(200).send({statusCode: 200, data: { ok: true, device: newDevice._id }})

        } catch (error) {
          req.log.error(error);
          return rep.code(400).send({statusCode: 400, message: 'Bad Request'});
        }
    })
}

export default fp(DeviceRoute);