import { Schema, Document, model, Model } from 'mongoose'

export interface EmployeeModel extends Model<EmployeeI> {
}

interface EmployeeI extends Document{
    _id: String,
    department: String,
    position: Number
}


const schema: Schema = new Schema<EmployeeI>(
    {
        department: String,
        position: Number
    },
    { autoIndex: false }
)

export const Employee = model<EmployeeI, EmployeeModel>('Employee', schema)