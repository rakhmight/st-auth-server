import { BaseReqI } from "./general";

export interface DeviceAddReqI extends BaseReqI {
    data: {
        id: String,
        code: string
    }
}