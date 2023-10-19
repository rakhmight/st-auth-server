import { FastifyReply, FastifyRequest } from "fastify";
import { AuthReqI, GetUserReqI, GetUsersReqI } from "../routes/@types/user";
import { Device } from "../models/device";
import { BaseReqI } from "../routes/@types/general";

export default async function(req:FastifyRequest<{Body: BaseReqI | AuthReqI}>, rep:FastifyReply, done:Function){

    try {
        if(req.body.auth.requesting == 'device' && req.body.deviceData){
            const deviceData = req.body.deviceData

            if(deviceData){
                const device = await Device.findById(deviceData.id)
    
                if(device) {
                    if(device.code != deviceData.code){
                        req.log.error({ actor: 'Middleware' }, `Invalid ${deviceData.id} device code`);
                        return rep.code(403).send({statusCode: 403, message: 'Device code is invalid'});
                    }
                } else {
                    req.log.error({ actor: 'Middleware' }, `Cheking undefined device with id ${deviceData.id}`);
                    return rep.code(404).send({statusCode: 404, message: 'Device not found'});
                }
            }
        }
    } catch (error) {
        req.log.fatal({ actor: 'Middleware' }, (error as Error).message);
        return rep.code(500).send({statusCode: 500, message: 'Internal server error'});
    }
}