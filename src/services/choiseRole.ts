import { Student } from "../models/student";
import { Enrollee, EnrolleeI } from "../models/enrollee";
import { Teacher } from "../models/teacher";
import { Employee } from "../models/employee";
import { UserRolePropertiesI } from "../routes/@types/user";
import { FastifyRequest } from "fastify";

export default async function (id:String, role:String, properties:UserRolePropertiesI, req:FastifyRequest):Promise<void | EnrolleeI >{
    if(role=='student'){
        await Student.create({
            _id: id,
            group: properties.group,
            educationForm: properties.educationForm,
            recieptDate: properties.recieptDate
        })
        .then(()=>{
            req.log.info({ actor: 'Service' }, `New student ${id} added`);
        })
        .catch(error => {
            req.log.fatal({ actor: 'Service' }, `Error while adding student: ${(error as Error).message}`);
        })
    }else if(role=='enrollee'){
        const enrollee = await Enrollee.create({
            _id: id,
            group: properties.group,
            formOfEducation: properties.formOfEducation,
            admissionYear: properties.admissionYear
        })
        .then(()=>{
            req.log.info({ actor: 'Service' }, `New enrollee ${id} added`);
        })
        .catch(error => {
            req.log.fatal({ actor: 'Service' }, `Error while adding enrollee: ${(error as Error).message}`);
        })

        return enrollee
    }else if(role=='teacher'){
        await Teacher.create({
            _id: id,
            department: properties.department,
            position: properties.position
        })
        .then(()=>{
            req.log.info({ actor: 'Service' }, `New teacher ${id} added`);
        })
        .catch(error => {
            req.log.fatal({ actor: 'Service' }, `Error while adding teacher: ${(error as Error).message}`);
        })
    }else if(role=='employee'){
        await Employee.create({
            _id: id,
            department: properties.department,
            position: properties.position
        })
        .then(()=>{
            req.log.info({ actor: 'Service' }, `New employee ${id} added`);
        })
        .catch(error => {
            req.log.fatal({ actor: 'Service' }, `Error while adding employee: ${(error as Error).message}`);
        })
    }
}