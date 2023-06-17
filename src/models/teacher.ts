import { Schema, Document, model, Model } from 'mongoose'

export interface TeacherModel extends Model<TeacherI> {
}

interface TeacherI extends Document{
    _id: String,
    department: String,
    position: Number
}


const schema: Schema = new Schema<TeacherI>(
    {
        department: String,
        position: Number
    },
    { autoIndex: false }
)

export const Teacher = model<TeacherI, TeacherModel>('Teacher', schema)