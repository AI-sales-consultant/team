// 删除所有与db相关的import和类型

export interface RegisterData {
  firstName: string
  lastName: string
  phoneNumber?: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export class AuthService {}
