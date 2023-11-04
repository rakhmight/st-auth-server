import { UserI } from "../models/user";
import genToken from '../utils/genToken';
import { User } from "../models/user";
import { RefreshUserTokenOutputI, UserFromStore } from "../routes/@types/user";
import fs from 'fs'
import path from 'path'

export default async function (user:UserI, password: string):Promise<RefreshUserTokenOutputI> {
    const isPasswordValid = await user.comparePasswords(user.auth.password, password)

    if(isPasswordValid){
        const newToken = genToken(128)
        const date = Date.now()

        await User.updateOne(
          {_id: user._id},
          {'auth.token':{
            date,
            key: newToken
          }}
        )
        
        const roleProperties = getUserProperties(user._id)

        return {
            error: { value: false },
            data: {
                userData:{
                    bio: user.bio,
                    userRole: user.userRole,
                    permission: user.permission,
                    roleProperties
                },
                authData: {
                    id: user._id,
                    login: user.auth.login,
                    token: { key: newToken, date }
                }
            }
        }
    } else {
        return { error: { value: true, msg: 'password' } }
    }
}

function getUserProperties (userID: String){
    const usersList:Array<UserFromStore> = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'storage', 'users', 'users.json'),{encoding:'utf8', flag:'r'}))

    if(usersList){
        const userTarget = usersList.find(user => user.id == userID)
        if(userTarget) return userTarget.roleProperties
        else return null
    } else return null
}