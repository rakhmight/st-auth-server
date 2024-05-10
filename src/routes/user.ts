import { 
    FastifyInstance, 
    FastifyPluginOptions, 
    FastifyPluginAsync
} from 'fastify';
import fp from 'fastify-plugin';
import { Db } from '../plugins/db';
import checkToken from '../middleware/checkToken';
import { AddUserDataI, AddUserReqI, AddUsersReqI, AuthReqI, CheckedUserCtxI, EditUserReqI, FindUsersByDepReqI, GetUserReqI, GetUsersReqI, PwdCompareReqI, RefreshUserTokenOutputI, SigninReqI, UserFromStore } from './@types/user';
import { User } from '../models/user'
import fs from 'fs'
import path from 'path'
import choiseRole from '../services/choiseRole';
import refreshUserToken from '../services/refreshUserToken';
import checkDevice from '../middleware/checkDevice';
import { BaseReqI } from './@types/general';
import checkIsAdmin from '../middleware/checkIsAdmin';
import { Teacher } from '../models/teacher';
import makeReq from '../utils/makeReq';
import prepareUser from '../services/prepareUser';
import afs from 'fs/promises'
import bcrypt from 'bcrypt'

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
                    req.log.error({ actor: 'Route: users' }, `User with login ${userData.login} entered the wrong password`);
                    return rep.code(404).send({statusCode: 404, message: 'User not found'});
                } else if(!tokenRefreshProcess.error.value) {
                    req.log.info({ actor: 'Route: users' }, `User ${user._id} (${user.bio.lastName} ${user.bio.firstName}) is authorized`);
                    return rep.code(200).send({statusCode: 200, data: { ...tokenRefreshProcess.data }});
                }
            } else {
                req.log.error({ actor: 'Route: users' }, `User with login ${userData.login} not found`);
                return rep.code(404).send({statusCode: 404, message: 'User not found'});
            }
        } catch (error) {
          req.log.fatal({ actor: 'Route: users' }, (error as Error).message);
          return rep.code(400).send({statusCode: 400, message: 'Bad Request'});
        }
    })
    
    fastify.post<{Body: AuthReqI}>('/api/user/auth', {preHandler: [checkDevice]}, async (req, rep) => { // for signin by id & password
        try {
            const userData = req.body.auth

            const user = await User.findOne({ '_id': userData.id })

            if(user){
                const tokenRefreshProcess:RefreshUserTokenOutputI = await refreshUserToken(user, userData.password)

                if(tokenRefreshProcess.error.value && tokenRefreshProcess.error.msg == 'password'){
                    req.log.error({ actor: 'Route: users' }, `User with id ${userData.id} entered the wrong password`);
                    return rep.code(404).send({statusCode: 404, message: 'User not found'});
                } else if(!tokenRefreshProcess.error.value) {
                    req.log.info({ actor: 'Route: users' }, `User ${user._id} (${user.bio.lastName} ${user.bio.firstName}) is authorized`);
                    return rep.code(200).send({statusCode: 200, data: { ...tokenRefreshProcess.data }});
                }
            } else {
                req.log.error({ actor: 'Route: users' }, `User with id ${userData.id} not found`);
                return rep.code(404).send({statusCode: 404, message: 'User not found'});
            }
        } catch (error) {
          req.log.fatal({ actor: 'Route: users' }, (error as Error).message);
          return rep.code(400).send({statusCode: 400, message: 'Bad Request'});
        }
    })
    
    fastify.post<{Body: BaseReqI}>('/api/user/check', {preHandler: [checkToken, checkDevice]}, async (req, rep) => { // for checking auth state & permission
        try {
            if(!req.body.deviceData){
                req.log.info({ actor: 'Route: users' }, `User with id ${req.body.auth.id} (${req.user.userData.bio.lastName} ${req.user.userData.bio.firstName}) successefully authorized`);
            } else {
                req.log.info({ actor: 'Route: users' }, `Device with id ${req.body.deviceData.id} successefully identified`);
            }
            return rep.code(200).send({statusCode: 200, data:{ ...req.user }})
        } catch (error) {
            req.log.fatal({ actor: 'Route: users' }, (error as Error).message);
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

            req.log.info({ actor: 'Route: users' }, `User ${req.body.auth.id} logged out`);
            return rep.code(200).send({statusCode: 200, data: { ok: true, updateCount: updateOperation.modifiedCount }})
        } catch (error) {
          req.log.fatal({ actor: 'Route: users' }, (error as Error).message);
          return rep.code(400).send({statusCode: 400, message: 'Bad Request'});
        }
    })
    
    fastify.post<{Body: PwdCompareReqI}>('/api/user/validate', {preHandler: [ checkToken ]}, async (req, rep) => {  // for password comparison
        try {
            const userData = req.body.auth
            const user = await User.findById(userData.checkedID)
            
            if(user){
                const isPasswordValid = await user.comparePasswords(user.auth.password!, userData.password)

                if(isPasswordValid){
                    req.log.error({ actor: 'Route: users' }, `User ${userData.checkedID} (${user.bio.lastName} ${user.bio.firstName}) password is valid`);
                    return rep.code(200).send({statusCode: 200, data:{ ok: true, user: { ...req.user } }})
                } else {
                    req.log.error({ actor: 'Route: users' }, `User ${userData.checkedID} (${user.bio.lastName} ${user.bio.firstName}) password is invalid`);
                    return rep.code(403).send({statusCode: 403, message: 'Password is invalid'})
                }
            }

        } catch (error) {
          req.log.fatal({ actor: 'Route: users' }, (error as Error).message);
          return rep.code(400).send({statusCode: 400, message: 'Bad Request'});
        }
    })

    fastify.post<{Body: AddUserReqI}>('/api/user/add', {preHandler: [checkToken, checkIsAdmin]}, async (req, rep) => {
        try {

            const userData:AddUserDataI = req.body.data
    
            const checkExist = await User.findOne({
                'auth.login': userData.auth.login
            });
            
            if (checkExist) {
                req.log.info(`[ST-Auth] User with login ${userData.auth.login} already exists`);
                return rep.code(409).send({statusCode: 409, msg: 'User with given login already exists'})
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
                    hasSign: userData.createSign,
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
                        req.log.fatal({ actor: 'Route: users' }, `Failed to write user avatar to local storage: ${(error as Error).message}`);
                    }
                } else {
                    try {
                        fs.copyFile(path.join(__dirname, '..', 'storage', 'avatars', 'default', `default_avatar.png`), path.join(__dirname, '..', 'storage', 'avatars', `${newUser._id}.png`), function(err) {
                            if(err) throw err
                        });
                    } catch (error) {
                        req.log.fatal({ actor: 'Route: users' }, `Failed to write user avatar to local storage: ${(error as Error).message}`);
                    }
                }
                const sign:Boolean | Object = userData.createSign ? await makeReq(`${process.env.ST_ADMIN_SERVER_IP}/api/signs/create`, "POST", {
                    auth: {
                        id: req.body.auth.id,
                        token: req.body.auth.token
                    },
                    data: {
                        _id: newUser._id
                    }
                }) : false
                
                await choiseRole(newUser._id, newUser.userRole, userData.roleProperties, req)
    
                const userToStore:UserFromStore = {
                    id: newUser._id,
                    bio: newUser.bio,
                    status: newUser.status,
                    userRole: newUser.userRole,
                    roleProperties: userData.roleProperties,
                    permission: newUser.permission,
                    hasSign: newUser.hasSign
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
                                req.log.info({ actor: 'Route: users' }, 'The data is saved in the users local storage');
    
                            });
                        } catch (error) {
                            req.log.fatal({ actor: 'Route: users' }, `Failed to write user to local storage: ${(error as Error).message}`);
                        }
                    })
                } catch (error) {
                    req.log.fatal({ actor: 'Route: users' }, `Failed to read users local storage: ${(error as Error).message}`);
                }

                req.log.info({ actor: 'Route: users' }, `New user added. Login: ${newUser.auth.login}`);
                return rep.code(200).send({statusCode: 200, data:{ user: userToStore, sign }})
            }
            

        } catch (error) {
          req.log.fatal({ actor: 'Route: users' }, (error as Error).message);
          return rep.code(400).send({statusCode: 400, message: 'Bad Request'});
        }
    })

    fastify.post<{Body: EditUserReqI}>('/api/user/edit-user', {preHandler: [checkToken, checkIsAdmin]}, async (req, rep) => {
        try {

            const userData = req.body.data

            // users.json
            const usersFile = await afs.readFile(path.join(__dirname, '..', 'storage', 'users', 'users.json'))
            .catch(error => { throw error })

            if (usersFile) {
                const usersFromStore:Array<UserFromStore> = JSON.parse(usersFile.toString())
                const userFromLS = usersFromStore.find(user => user.id == userData.userID)

                if(userFromLS){
                    const index = usersFromStore.indexOf(userFromLS)
                    usersFromStore[index].bio.firstName = userData.firstName
                    usersFromStore[index].bio.lastName = userData.lastName
                    usersFromStore[index].bio.patronymic = userData.patronymic
                }
                
                const writeNewUsers = await afs.writeFile(path.join(__dirname, '..', 'storage', 'users', 'users.json'), JSON.stringify(usersFromStore))
                .catch(error => { throw error })

                const updateOperation = await User.updateOne(
                    {
                        '_id': userData.userID
                    },
                    { $set: {
                        'bio.firstName': userData.firstName,
                        'bio.lastName': userData.lastName,
                        'bio.patronymic': userData.patronymic
                    }}
                )
                
                if(userData.password){
                    const password = await bcrypt.hash(userData.password, 12)
                    const updatePassword = await User.updateOne(
                        {
                            '_id': userData.userID
                        },
                        { $set: {
                            'auth.login': userData.password,
                            'auth.password': password
                            }
                        }
                    )


                    req.log.info({ actor: 'Route: users' }, `ID ${userData.userID} user's data is updated`);
                    return rep.code(200).send({statusCode: 200, data:{ updatePassword, updateOperation, writeNewUsers }})
                } else{
                    req.log.info({ actor: 'Route: users' }, `ID ${userData.userID} user's data is updated`);
                    return rep.code(200).send({statusCode: 200, data:{ updateOperation, writeNewUsers }})
                }
            } else {
                req.log.fatal({ actor: 'Route: users' }, 'User not found');
                return rep.code(404).send({statusCode: 404, message: 'User not found'});
            }

        } catch (error) {
          req.log.fatal({ actor: 'Route: users' }, (error as Error).message);
          return rep.code(400).send({statusCode: 400, message: 'Bad Request'});
        }
    })


    //! ======================================== !
    fastify.post<{Body: AddUsersReqI}>('/api/user/multipleadd', {preHandler: [checkToken, checkIsAdmin]}, async (req, rep) => {
        try {

            const usersList = req.body.data.users


            const usersToStore:Array<UserFromStore> = await Promise.all(
                usersList.map(async user=>{
                const { preparedUser } = await prepareUser(user, { id: req.body.auth.id, token: req.body.auth.token}, req)

                return preparedUser
            }))

            const usersFile = await afs.readFile(path.join(__dirname, '..', 'storage', 'users', 'users.json'))
            .catch(error => { throw error })

            const usersFromStoreArray = []
            if (usersFile) {
                let usersFromStore:Array<UserFromStore> = JSON.parse(usersFile.toString())
                usersFromStoreArray.push(...usersFromStore, ...usersToStore)
            } else {
                usersFromStoreArray.push(...usersToStore)
            }

            const writeNewUsers = await afs.writeFile(path.join(__dirname, '..', 'storage', 'users', 'users.json'), JSON.stringify(usersFromStoreArray))
            .catch(error => { throw error })            
            
            req.log.info({ actor: 'Route: users' }, 'Multiple users adding');
            return rep.code(200).send({statusCode: 200, data:{ users: usersToStore, writeNewUsers }})

        } catch (error) {
          req.log.fatal({ actor: 'Route: users' }, (error as Error).message);
          return rep.code(400).send({statusCode: 400, message: 'Bad Request'});
        }
    })
    //! ======================================== !

    fastify.post<{Body: GetUsersReqI}>('/api/user/get', {preHandler: [checkToken, checkDevice]}, async (req, rep) => {
        try {
            const usersList = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'storage', 'users', 'users.json'),{encoding:'utf8', flag:'r'}))
            
            if(req.body.auth.requesting=='client'){
                req.log.info({ actor: 'Route: users' }, `User ${req.body.auth.id} get users list`);
            } else if(req.body.auth.requesting=='device'){
                req.log.info({ actor: 'Route: users' }, `Device ${req.body.data.device?.id} get users list`);
            }
            return rep.code(200).send({statusCode: 200, data: { usersList }})
        } catch (error) {
          req.log.fatal({ actor: 'Route: users' }, (error as Error).message);
          return rep.code(400).send({statusCode: 400, message: 'Bad Request'});
        }
    })

    fastify.post<{Body: GetUserReqI}>('/api/user/getone', {preHandler: [checkToken, checkDevice]}, async (req, rep) => {
        try {
            const userData = req.body.data

            const users:Array<UserFromStore> = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'storage', 'users', 'users.json'),{encoding:'utf8', flag:'r'}))

            const user:UserFromStore | undefined = users.find(u => u.id == userData.id)

            if(user){
                req.log.info({ actor: 'Route: users' }, `User ${req.body.auth.id} get user data with id ${userData.id}`);
                return rep.code(200).send({statusCode: 200, data: { user }})
            } else {
                req.log.error({ actor: 'Route: users' }, `User ${req.body.auth.id} tried to get an unknown user`);
                return rep.code(404).send({statusCode: 400, message: 'User not found'})
            }
        } catch (error) {
          req.log.fatal({ actor: 'Route: users' }, (error as Error).message);
          return rep.code(400).send({statusCode: 400, message: 'Bad Request'});
        }
    })

    fastify.post<{Body: FindUsersByDepReqI}>('/api/user/findbydep', {preHandler: [checkToken]}, async (req, rep) => {
        try {
            const usersList = await Teacher.find({ department: req.body.data.department })

            req.log.info({ actor: 'Route: users' }, `User ${req.body.auth.id} get user from ${req.body.data.department} department`);
            return rep.code(200).send({statusCode: 200, data: { usersList }})
        
        } catch (error) {
          req.log.fatal({ actor: 'Route: users' }, (error as Error).message);
          return rep.code(400).send({statusCode: 400, message: 'Bad Request'});
        }
    })
}


export default fp(UserRoute);