import { FastifyReply, FastifyRequest } from "fastify";
import { User } from "../models/user";
import { BaseReqI } from "../routes/@types/general";
import getRoleProperties from "../utils/getRoleProperties";

export default async function(req:FastifyRequest<{ Body: BaseReqI }>, rep:FastifyReply, done:Function){
    try {
        if(req.body.auth.requesting == 'client'){
            const userData = req.body.auth
            const user = await User.findOne({
                '_id': userData.id
            })
        
            if (user) {
                
                const userRole = await getRoleProperties(user._id, user.userRole)

                if(userRole===null){
                    req.log.info(`[ST-Auth] Could not find user ${userData.id} role properties`);
                    return rep.code(404).send({statusCode: 404, message: 'User not found'}); 
                }
                
                if(user.auth.token.key && user.auth.token.date){
                    if (user.auth.token.key==userData.token) {
                        if (Date.now()-86400000 < user.auth.token.date!) {
                            req.user = {
                                userData : {
                                    bio:{...user.bio},
                                    userRole: user.userRole,
                                    permission: user.permission,
                                    roleProperties: userRole
                                },
                                tokenLife: user.auth.token.date!
                            }
                        } else {
                            req.log.info(`[ST-Auth] User ${userData.id} token lifecircle is over`);
                            return rep.code(404).send({statusCode: 404, message: 'Token lifecircle is over'});
                        }
                    } else {
                        req.log.info(`[ST-Auth] User ${userData.id} token is not valid`);
                        return rep.code(403).send({statusCode: 403, message: 'Token is invalid'});
                    }
                } else {
                    req.log.info(`[ST-Auth] User ${userData.id} is not authorized`);
                    return rep.code(403).send({statusCode: 403, message: 'Not access'});
                }
            } else {
                req.log.info(`[ST-Auth] User ${userData.id} is not found`);
                return rep.code(404).send({statusCode: 404, message: 'User not found'});
            }
        }
    } catch (error) {
        req.log.error(error);
        return rep.code(500).send({statusCode: 500, message: 'Internal server error'});
    }
}