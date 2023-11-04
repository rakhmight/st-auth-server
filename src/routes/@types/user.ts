import { UserStatusI } from "../../models/@types/user"
import { BaseReqI } from "./general"

export interface AddUserReqI extends BaseReqI {
    data: AddUserDataI
}

export interface AddUserDataI {
        bio: UserBioI,
        auth: {
            password: String,
            login: String
        },
        userRole: String,
        permission: Number,
        roleProperties: UserRolePropertiesI,
        createSign: Boolean
}

export interface AddUsersReqI extends BaseReqI{
    data: {
        users: Array<UsersListI>
    }
}

interface UsersListI {
    Role: 'student' | 'enrollee' | 'teacher' | 'employee',
    FullName: string,
    Region: number,
    State: string,
    Login: string,
    Permission: 'user' | 'author' | 'inspector' | 'admin',
    Department?: string,
    Position?: number,
    hasSign?: any,
    Course: number
}


interface UserBioI {
    firstName: string,
    lastName: string,
    patronymic: string,
    avatar?: string | undefined,
    geo:{
      state: string,
      region: Number
    }
}

export interface UserRolePropertiesI {
    educationForm?: String | undefined,
    group?: Number | undefined,
    formOfEducation?: String | undefined,
    recieptDate?: String | undefined,
    admissionYear?: String | undefined,
    department?: String | undefined,
    position?: Number | undefined,
}

export interface UserFromStore {
    id: String,
    bio: UserBioI,
    status: UserStatusI,
    userRole: String,
    roleProperties: UserRolePropertiesI,
    permission: Number,
    hasSign: Boolean
}

export interface SigninReqI {
    auth:{
        login: string,
        password: string
    }
}

export interface AuthReqI {
    auth:{
        id: string,
        password: string,
        requesting: string
    },
    deviceData?:{
        id: string,
        code: string
    }
}

export interface PwdCompareReqI {
    auth:{
        id: string,
        token: string,
        requesting: string,
        checkedID: string,
        password: string
    }
}

export interface RefreshUserTokenOutputI {
    error: {
        value: Boolean,
        msg?: String
    },
    data?:{
        userData: {
            bio: UserBioI,
            userRole: String,
            permission: Number,
            roleProperties: UserRolePropertiesI | null
        },
        authData: {
            id: String,
            login: String,
            token: {
                key: String,
                date: Number
            }
        }
    }
}

export interface CheckedUserCtxI {
    userData: {
        bio: UserBioI,
        userRole: String,
        permission: Number,
        roleProperties: UserRolePropertiesI
    },
    tokenLife: Number
}

export interface GetUserReqI extends BaseReqI {
    data:{
        id: string,
        device?: {
            id: String,
            code: string
        }
    }
}

export interface GetUsersReqI extends BaseReqI {
    data:{
        device?: {
            id: String,
            code: string
        }
    }
}

export interface FindUsersByDepReqI extends BaseReqI {
    data: {
        department: String
    }
}