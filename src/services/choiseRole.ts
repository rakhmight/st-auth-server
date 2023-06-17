import { Student } from "../models/student";
import { Enrollee } from "../models/enrollee";
import { Teacher } from "../models/teacher";
import { Employee } from "../models/employee";
import { UserRolePropertiesI } from "../routes/@types/user";

export default async function (id:String, role:String, properties:UserRolePropertiesI):Promise<void>{
    if(role=='student'){
        await Student.create({
            _id: id,
            group: properties.group,
            educationForm: properties.educationForm,
            recieptDate: properties.recieptDate
        })
        .then(()=>{
            console.log(`[Auth-api] New student ${id} added`);
        })
        .catch(err=>{
            console.log(`[Auth-api] Error while adding student: ${err}`);
        })
    }else if(role=='enrollee'){
        await Enrollee.create({
            _id: id,
            group: properties.group,
            formOfEducation: properties.formOfEducation,
            admissionYear: properties.admissionYear
        })
        .then(()=>{
            console.log(`[Auth-api] New enrollee ${id} added`);
        })
        .catch(err=>{
            console.log(`[Auth-api] Error while adding enrollee: ${err}`);
        })
    }else if(role=='teacher'){
        await Teacher.create({
            _id: id,
            department: properties.department,
            position: properties.position
        })
        .then(()=>{
            console.log(`[Auth-api] New teacher ${id} added`);
        })
        .catch(err=>{
            console.log(`[Auth-api] Error while adding teacher: ${err}`);
        })
    }else if(role=='employee'){
        await Employee.create({
            _id: id,
            department: properties.department,
            position: properties.position
        })
        .then(()=>{
            console.log(`[Auth-api] New employee ${id} added`);
        })
        .catch(err=>{
            console.log(`[Auth-api] Error while adding employee: ${err}`);
        })
    }
}