import { FastifyReply, FastifyRequest } from "fastify";
import { GetUserReqI, GetUsersReqI } from "../routes/@types/user";
import { Device } from "../models/device";

export default async function(req:FastifyRequest<{Body: GetUsersReqI | GetUserReqI}>, rep:FastifyReply, done:Function){

    try {
        if(req.body.auth.requesting == 'device'){
            const deviceData = req.body.data.device

            if(deviceData){
                const device = await Device.findById(deviceData.id)
    
                if(device) {
                    if(device.code != deviceData.code){
                        req.log.info(`Invalid ${deviceData.id} device code`);
                        return rep.code(403).send({statusCode: 403, message: 'Device code is invalid'});
                    }
                } else {
                    req.log.info(`Cheking undefined device with id ${deviceData.id}`);
                    return rep.code(404).send({statusCode: 404, message: 'Device not found'});
                }
            }
        }
    } catch (error) {
        req.log.error(error);
        return rep.code(500).send({statusCode: 500, message: 'Internal server error'});
    }
}