import { Schema, Document, model, Model } from 'mongoose'

export interface DeviceModel extends Model<DeviceI> {
}

interface DeviceI extends Document{
    _id: String,
    code: string
}


const schema: Schema = new Schema<DeviceI>(
    {
        code: String
    },
    { autoIndex: false }
)

export const Device = model<DeviceI, DeviceModel>('Device', schema)