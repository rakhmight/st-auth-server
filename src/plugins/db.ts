import { FastifyInstance } from 'fastify';
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import mongoose from 'mongoose';
import { UserModel, User } from '../models/user';
import { StudentModel, Student } from '../models/student';
import { TeacherModel, Teacher } from '../models/teacher';
import { EmployeeModel, Employee } from '../models/employee';
import { EnrolleeModel, Enrollee } from '../models/enrollee';
import { DeviceModel, Device } from '../models/device';

export interface Models {
    User: UserModel;
    Student: StudentModel;
    Teacher: TeacherModel;
    Employee: EmployeeModel;
    Enrollee: EnrolleeModel;
    Device: DeviceModel
}

export interface Db {
    models: Models;
}
// define options
export interface MyPluginOptions {
}

const ConnectDB: FastifyPluginAsync<MyPluginOptions> = async (
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) => {
    try {
        mongoose.connection.on('connected', () => {
            fastify.log.info({ actor: 'MongoDB' }, 'connected');
        });
        mongoose.connection.on('disconnected', () => {
            fastify.log.error({ actor: 'MongoDB' }, 'disconnected');
        });
        const db = await mongoose.connect(options.url, {
            autoIndex: false,
        });
        const models: Models = { User, Student, Teacher, Employee, Enrollee, Device };
        fastify.decorate('db', { models });
    } catch (error) {
        fastify.log.fatal({ actor: 'MongoDB' }, (error as Error).message);
    }
};
export const dbPlugin = fp(ConnectDB);