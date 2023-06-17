import { FastifyReply, FastifyRequest } from "fastify";
import { BaseReqI } from "../routes/@types/general";

export default async function(req:FastifyRequest<{ Body: BaseReqI }>, rep:FastifyReply, done:Function) {

    if(req.user.userData.permission !=3){
        req.log.info(`[ST-Auth] User ${req.body.auth.id} try add new user`)
        return rep.code(403).send({statusCode: 403, message: 'Not permission'})
    }

}