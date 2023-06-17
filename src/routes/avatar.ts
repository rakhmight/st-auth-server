import { 
    FastifyInstance, 
    FastifyPluginOptions, 
    FastifyPluginAsync,
    FastifyReply,
    FastifyRequest
} from 'fastify';
import fp from 'fastify-plugin';
import path from 'path'
import fs from 'fs'

const AvatarRoute: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {

    fastify.get('/api/avatar/get:user', async (req:FastifyRequest<{
        Querystring: {
          user: string,
        };
    }>, rep:FastifyReply) => {
        try {
            const avatarFile = fs.readFileSync(path.join(__dirname, '..', 'storage', 'avatars', `${req.query.user}.png`))
            
            const avatar = avatarFile.toString('base64')
    
            rep.send(avatar)
        } catch (error) {
            req.log.error(error);
            return rep.code(500).send({statusCode: 500, message: 'Internal server error'});
        }
    })
}

export default fp(AvatarRoute);