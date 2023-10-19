import { User } from "../models/user";
import { UserFromStore } from "../routes/@types/user";
import choiseRole from "./choiseRole";
import afs from 'fs/promises'
import path from 'path'
import genToken from "../utils/genToken";
import makeReq from "../utils/makeReq";
import { FastifyRequest } from "fastify";

interface UserI {
    Role: 'student' | 'enrollee' | 'teacher' | 'employee',
    FullName: string,
    Region: number,
    State: string,
    Login: string,
    Permission: 'user' | 'author' | 'inspector' | 'admin',
    Department?: string,
    Position?: number,
    hasSign?: any,
    Course: number,
    Group?: number,
    Form?: string
}
export default async function prepareUser(user:UserI, reqData: { id:String, token: String }, req: FastifyRequest):Promise<{ preparedUser: UserFromStore, avatar: any, userData:any, sign:any }>{

    const fullName = user.FullName.split(' ')

    const login = `${Date.now()}${genToken(6)}`

    // Проверки
    const permission = user.Permission === 'admin' ? 3 : user.Permission === 'inspector' ? 2 : user.Permission === 'author' ? 1 : 0

    let roleProperties = {}
    if(user.Role === 'student'){
        roleProperties = {
            group: user.Group,
            educationForm: user.Form,
            recieptDate: new Date().getFullYear()-(user.Course-1)
        }
    } else if(user.Role === 'enrollee'){
        roleProperties = {
            group: user.Group,
            formOfEducation: user.Form,
            admissionYear: new Date().getFullYear()
        }
    } else if(user.Role === 'teacher'){
        roleProperties = {
            department: user.Department,
            position: user.Position
        }
    } else if(user.Role === 'employee'){
        roleProperties = {
            department: user.Department,
            position: user.Position
        }
    }

    const newUser = await User.create({
        bio: {
            firstName: fullName[0],
            lastName: fullName[1],
            patronymic: fullName[3] ? `${fullName[2]} ${fullName[3]}` : fullName[2],
            avatar: undefined,
            geo:{
              state: user.State || null,
              region: user.Region || null
            }
        },
        auth: {
            login: user.Login || login,
            password: user.Login || login,
            token: {
                key: undefined,
                date: undefined
            }
        },
        userRole: user.Role,
        permission,
        hasSign: user.hasSign || user.Role === 'teacher' ? true : false,
        status: {
          blocked:{
            state: false,
            date: undefined
          }
        }
    })

    const avatar = await afs.copyFile(path.join(__dirname, '..', 'storage', 'avatars', 'default', `default_avatar.png`), path.join(__dirname, '..', 'storage', 'avatars', `${newUser._id}.png`))
    
    const userData = await choiseRole(newUser._id, newUser.userRole, roleProperties, req)

    // Sign
    const sign:Boolean | Object = user.hasSign || user.Role === 'teacher' ? await makeReq(`${process.env.ST_ADMIN_SERVER_IP}/api/signs/create`, "POST", {
        auth: {
            id: reqData.id,
            token: reqData.token
        },
        data: {
            _id: newUser._id
        }
    }) : false
    
    const userToStore:UserFromStore = {
        id: newUser._id,
        bio: newUser.bio,
        status: newUser.status,
        userRole: newUser.userRole,
        roleProperties,
        permission: newUser.permission,
        hasSign: newUser.hasSign
    }

    return { preparedUser: userToStore, avatar, userData, sign }
}

// function getRecieptDate(course:number):number{
//     const date = new Date()
//     if(date.getMonth()+1 < 9) return date.getFullYear() - course
//     return 
// }