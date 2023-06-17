import { 
    FastifyInstance, 
    FastifyPluginOptions, 
    FastifyPluginAsync
} from 'fastify';
import fp from 'fastify-plugin';
import { Db } from '../plugins/db';
import checkToken from '../middleware/checkToken';
import { AddUserReqI, AuthReqI, CheckedUserCtxI, FindUsersByDepReqI, GetUserReqI, GetUsersReqI, PwdCompareReqI, RefreshUserTokenOutputI, SigninReqI, UserFromStore } from './@types/user';
import { User } from '../models/user'
import fs from 'fs'
import path from 'path'
import choiseRole from '../services/choiseRole';
import refreshUserToken from '../services/refreshUserToken';
import checkDevice from '../middleware/checkDevice';
import { BaseReqI } from './@types/general';
import checkIsAdmin from '../middleware/checkIsAdmin';
import { Teacher } from '../models/teacher';

// Declaration merging
declare module 'fastify' {
    export interface FastifyInstance {
        db: Db;
    }

    interface FastifyRequest {
        user: CheckedUserCtxI
    }
}

const UserRoute: FastifyPluginAsync = async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
    
    fastify.post<{Body: SigninReqI}>('/api/user/signin', async (req, rep) => { // for signin by login & password
        try {
            const userData = req.body.auth

            const user = await User.findOne({ 'auth.login': userData.login })

            if(user){
                const tokenRefreshProcess:RefreshUserTokenOutputI = await refreshUserToken(user, userData.password)

                if(tokenRefreshProcess.error.value && tokenRefreshProcess.error.msg == 'password'){

                    req.log.info(`[ST-Auth] User with login ${userData.login} entered the wrong password`);
                    return rep.code(404).send({statusCode: 404, message: 'User not found'});
                } else if(!tokenRefreshProcess.error.value) {
                    
                    req.log.info(`[ST-Auth] User ${user._id} (${user.bio.lastName} ${user.bio.firstName}) is authorized`);
                    return rep.code(200).send({statusCode: 200, data: { ...tokenRefreshProcess.data }});
                }
            } else {
                req.log.info(`[ST-Auth] User with login ${userData.login} not found`);
                return rep.code(404).send({statusCode: 404, message: 'User not found'});
            }
        } catch (error) {
          req.log.error(error);
          return rep.code(400).send({statusCode: 400, message: 'Bad Request'});
        }
    })
    
    fastify.post<{Body: AuthReqI}>('/api/user/auth', async (req, rep) => { // for signin by id & password
        try {
            const userData = req.body.auth

            const user = await User.findOne({ '_id': userData.id })

            if(user){
                const tokenRefreshProcess:RefreshUserTokenOutputI = await refreshUserToken(user, userData.password)

                if(tokenRefreshProcess.error.value && tokenRefreshProcess.error.msg == 'password'){

                    req.log.info(`[ST-Auth] User with id ${userData.id} entered the wrong password`);
                    return rep.code(404).send({statusCode: 404, message: 'User not found'});
                } else if(!tokenRefreshProcess.error.value) {
                    
                    req.log.info(`[ST-Auth] User ${user._id} (${user.bio.lastName} ${user.bio.firstName}) is authorized`);
                    return rep.code(200).send({statusCode: 200, data: { ...tokenRefreshProcess.data }});
                }
            } else {
                req.log.info(`[ST-Auth] User with id ${userData.id} not found`);
                return rep.code(404).send({statusCode: 404, message: 'User not found'});
            }
        } catch (error) {
          req.log.error(error);
          return rep.code(400).send({statusCode: 400, message: 'Bad Request'});
        }
    })
    
    fastify.post<{Body: BaseReqI}>('/api/user/check', {preHandler: [checkToken]}, async (req, rep) => { // for checking auth state & permission
        try {
            req.log.info(`[ST-Auth] User with id ${req.body.auth.id} (${req.user.userData.bio.lastName} ${req.user.userData.bio.firstName}) successefully authorized`)
            return rep.code(200).send({statusCode: 200, data:{ ...req.user }})
        } catch (error) {
            req.log.error(error);
            return rep.code(400).send({statusCode: 400, message: 'Bad Request'});
        }
    })
    
    fastify.post<{Body: BaseReqI}>('/api/user/logout', { preHandler: [checkToken] }, async (req, rep) => {
        try {
            const updateOperation = await User.updateOne(
                {_id: req.body.auth.id},
                {'auth.token':{
                  date: undefined,
                  key: undefined
            }})

            req.log.info(`[ST-Auth] User ${req.body.auth.id} logged out`)
            return rep.code(200).send({statusCode: 200, data: { ok: true, updateCount: updateOperation.modifiedCount }})
        } catch (error) {
          req.log.error(error);
          return rep.code(400).send({statusCode: 400, message: 'Bad Request'});
        }
    })
    
    fastify.post<{Body: PwdCompareReqI}>('/api/user/validate', {preHandler: [ checkToken ]}, async (req, rep) => {  // for password comparison
        try {
            const userData = req.body.auth
            const user = await User.findById(userData.id)
            
            if(user){
                const isPasswordValid = await user.comparePasswords(user.auth.password!, userData.password)

                if(isPasswordValid){
                    req.log.info(`[ST-Auth] User ${userData.id} (${user.bio.lastName} ${user.bio.firstName}) password is valid`)
                    return rep.code(200).send({statusCode: 200, data:{ ok: true, user: { ...req.user } }})
                } else {
                    req.log.info(`[ST-Auth] User ${userData.id} (${user.bio.lastName} ${user.bio.firstName}) password is invalid`)
                    return rep.code(403).send({statusCode: 403, message: 'Password is invalid'})
                }
            }

        } catch (error) {
          req.log.error(error);
          return rep.code(400).send({statusCode: 400, message: 'Bad Request'});
        }
    })

    fastify.post<{Body: AddUserReqI}>('/api/user/add', {preHandler: [checkToken, checkIsAdmin]}, async (req, rep) => {
        try {

            const userData = req.body.data
    
            const checkExist = await User.findOne({
                'auth.login': userData.auth.login
            });
            
            if (checkExist) {
                req.log.info(`[ST-Auth] User with login ${userData.auth.login} already exists`);
                return rep.code(409).send({statusCode: 409, msg: 'User with given login already exists.'})
            }else {
    
                const newUser = await User.create({
                    bio: userData.bio,
                    auth: {
                        login: userData.auth.login,
                        password: userData.auth.password,
                        token: {
                            key: undefined,
                            date: undefined
                        }
                    },
                    userRole: userData.userRole,
                    permission: userData.permission,
                    hasSign: false,
                    status: {
                      blocked:{
                        state: false,
                        date: undefined
                      }
                    }
                })
    
                if(userData.bio.avatar){
                    const base64Data = userData.bio.avatar!.replace(/^data:image\/png;base64,|^data:image\/jpeg;base64,|^data:image\/jpg;base64,/, "")
                    
                    try {
                        fs.writeFile(path.join(__dirname, '..', 'storage', 'avatars', `${newUser._id}.png`), base64Data, 'base64', function(err) {
                        if(err) throw err
                        });
                    } catch (error) {
                        console.log(`[Auth-api] Failed to write user to local storage: ${error}`)
                    }
                }
                
                await choiseRole(newUser._id, newUser.userRole, userData.roleProperties)
    
                const userToStore:UserFromStore = {
                    id: newUser._id,
                    bio: newUser.bio,
                    status: newUser.status,
                    userRole: newUser.userRole,
                    roleProperties: userData.roleProperties,
                    permission: newUser.permission
                }
                let usersStore:Array<UserFromStore> = []
    
                try {
                    fs.readFile(path.join(__dirname, '..', 'storage', 'users', 'users.json'), function (error, data:Buffer): void {
                        if (error) throw error;
    
                        if (data) {
                            let usersFromStore:Array<UserFromStore> = JSON.parse(data!.toString())
                            usersStore = usersFromStore
                            usersStore.push(userToStore);
                        } else {
                            usersStore = [userToStore];
                        }
    
                        try {
                            fs.writeFile(path.join(__dirname, '..', 'storage', 'users', 'users.json'), JSON.stringify(usersStore), function (error) {
                                if (error) throw error;
                                console.log('[Auth-api] The data is saved in the users local storage');
    
                            });
                        } catch (error) {
                            console.log(`[Auth-api] Failed to write user to local storage: ${error}`);
                        }
                    })
                } catch (error) {
                    console.log(`[Auth-api] Failed to read users local storage: ${error}`)
                }

                req.log.info(`[Auth-api] New user added. Login: ${newUser.auth.login}`)
                return rep.code(200).send({statusCode: 200, data:{ userToStore }})
            }
            

        } catch (error) {
          req.log.error(error);
          return rep.code(400).send({statusCode: 400, message: 'Bad Request'});
        }
    })

    //! ======================================== !
    fastify.post<{Body: AddUserReqI}>('/api/user/multipleadd', {preHandler: [checkToken, checkIsAdmin]}, async (req, rep) => {
        try {

        } catch (error) {
          req.log.error(error);
          return rep.code(400).send({statusCode: 400, message: 'Bad Request'});
        }
    })
    //! ======================================== !

    fastify.post<{Body: GetUsersReqI}>('/api/user/get', {preHandler: [checkToken, checkDevice]}, async (req, rep) => {
        try {
            const usersList = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'storage', 'users', 'users.json'),{encoding:'utf8', flag:'r'}))
            
            req.log.info(`[ST-Auth] User ${req.body.auth.id} get users list`)
            return rep.code(200).send({statusCode: 200, data: { usersList }})
        } catch (error) {
          req.log.error(error);
          return rep.code(400).send({statusCode: 400, message: 'Bad Request'});
        }
    })

    fastify.post<{Body: GetUserReqI}>('/api/user/getone', {preHandler: [checkToken, checkDevice]}, async (req, rep) => {
        try {
            const userData = req.body.data

            const users:Array<UserFromStore> = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'storage', 'users', 'users.json'),{encoding:'utf8', flag:'r'}))

            const user:UserFromStore | undefined = users.find(u => u.id == userData.id)

            if(user){
                req.log.info(`[ST-Auth] User ${req.body.auth.id} get user data with id ${userData.id}`)
                return rep.code(200).send({statusCode: 200, data: { user }})
            } else {
                req.log.info(`[ST-Auth] User ${req.body.auth.id} tried to get an unknown user`)
                return rep.code(404).send({statusCode: 400, message: 'User not found'})
            }
        } catch (error) {
          req.log.error(error);
          return rep.code(400).send({statusCode: 400, message: 'Bad Request'});
        }
    })

    fastify.post<{Body: FindUsersByDepReqI}>('/api/user/findbydep', {preHandler: [checkToken]}, async (req, rep) => {
        try {
            const usersList = await Teacher.find({ department: req.body.data.department })

            req.log.info(`[ST-Auth] User ${req.body.auth.id} get user from ${req.body.data.department} department`)
            return rep.code(200).send({statusCode: 200, data: { usersList }})
        
        } catch (error) {
          req.log.error(error);
          return rep.code(400).send({statusCode: 400, message: 'Bad Request'});
        }
    })
}


export default fp(UserRoute);