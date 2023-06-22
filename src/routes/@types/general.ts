export interface BaseReqI {
    auth: {
        id: String,
        token: String,
        requesting: string
    },
    deviceData?:{
        id: string,
        code: string
    }
}