export interface UserStatusI {
  blocked:{
    state: Boolean,
    date: Number | undefined
  }
}

export interface UserBioI {
  firstName: string,
  lastName: string,
  patronymic: string,
  geo:{
    state: string,
    region: Number
  }
}