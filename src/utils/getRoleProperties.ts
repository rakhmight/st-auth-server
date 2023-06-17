import { Student } from "../models/student";
import { Enrollee } from "../models/enrollee";
import { Teacher } from "../models/teacher";
import { Employee } from "../models/employee";
import { UserRolePropertiesI } from "../routes/@types/user";

export default async function (id:String, role:String):Promise<UserRolePropertiesI | null> {
    {
        let roleProperties = null

        if(role == 'student'){
            const student = await Student.findById(id)
            if(student){
                roleProperties = { group: student.group, educationForm: student.educationForm, recieptDate: student.recieptDate }
            }
        } else if(role == 'enrollee'){
            const enrollee = await Enrollee.findById(id)
            if(enrollee){
                roleProperties = { group: enrollee.group, formOfEducation: enrollee.formOfEducation, admissionYear: enrollee.admissionYear }
            }
        } else if(role == 'teacher'){
            const teacher = await Teacher.findById(id)
            if(teacher){
                roleProperties = { department: teacher.department, position: teacher.position}
            }
        } else if(role == 'employee'){
            const employee = await Employee.findById(id)
            if(employee){
                roleProperties = { department: employee.department, position: employee.position}
            }
        }

        return roleProperties
    }
}