import { Schema, Document, model, Model } from 'mongoose'

export interface EnrolleeModel extends Model<EnrolleeI> {
}

interface EnrolleeI extends Document{
    _id: String,
    group: Number,
    formOfEducation: String,
    admissionYear: String,
}


const schema: Schema = new Schema<EnrolleeI>(
    {
        group: Number,
        formOfEducation: String,
        admissionYear: String,
    },
    { autoIndex: false }
)

export const Enrollee = model<EnrolleeI, EnrolleeModel>('Enrollee', schema)