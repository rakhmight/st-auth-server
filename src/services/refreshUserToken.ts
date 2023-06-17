import { UserI } from "../models/user";
import genToken from '../utils/genToken';
import { User } from "../models/user";
import { RefreshUserTokenOutputI } from "../routes/@types/user";

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
        
        return {
            error: { value: false },
            data: {
                userData:{ bio: user.bio, userRole: user.userRole },
                authData: { id: user._id, token: { key: newToken, date } }
            }
        }
    } else {
        return { error: { value: true, msg: 'password' } }
    }
}