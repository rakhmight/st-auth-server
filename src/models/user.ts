import { Schema, Document, model, Model } from 'mongoose'
import bcrypt from 'bcrypt'
import { UserBioI, UserStatusI } from './@types/user'

export interface UserModel extends Model<UserI> {
}

export interface UserI extends Document{
    _id: String,
    bio: UserBioI,
    auth:{
      login: string,
      password: string,
      token:{
        date: number | undefined,
        key: string | undefined
      },
    },
    userRole: string,
    permission: number,
    hasSign: Boolean,
    status: UserStatusI,
    comparePasswords(hashedPassword: string, candidatePassword: string): boolean,
}

const schema: Schema = new Schema<UserI>(
    {
        bio: {
          firstName: String,
          lastName: String,
          patronymic: String,
          geo:{
            state: String,
            region: Number
          }
        },
        auth:{
          login: {
            type: String,
            index: true,
            unique: true,
          },
          password: { type: String, required: true },
          token:{
            date: Number || undefined,
            key: String || undefined
          }
        },
        userRole: String,
        permission: Number,
        hasSign: Boolean,
        status: {
          blocked:{
            state: Boolean,
            date: Number || undefined
          }
        }
    },
    { timestamps: true, strict: true, strictQuery: true }
)

schema.methods.comparePasswords = async function (hashedPassword: string, candidatePassword: string) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
  
  schema.pre('save', async function () {
      // Hash password if the password is new or was updated
      if (!this.isModified('auth.password')) return;
  
      // Hash password with costFactor of 12
      this.auth.password = await bcrypt.hash(this.auth.password, 12)
  })

export const User = model<UserI, UserModel>('User', schema)