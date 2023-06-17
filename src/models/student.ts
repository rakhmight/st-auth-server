import { Schema, Document, model, Model } from 'mongoose'

export interface StudentModel extends Model<StudentI> {
}

interface StudentI extends Document{
    _id: String,
    group: Number,
    educationForm: String
    recieptDate: String
}


const schema: Schema = new Schema<StudentI>(
    {
        group: Number,
        educationForm: String,
        recieptDate: String
    },
    { autoIndex: false }
)

export const Student = model<StudentI, StudentModel>('Student', schema)