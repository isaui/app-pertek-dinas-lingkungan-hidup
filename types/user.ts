export interface User {
  id: string
  name: string
  username: string | null
  email: string
  instansi: string | null
  nomorHp: string | null
  createdAt: string | Date
  updatedAt: string | Date
  emailVerified: boolean | string | null
  role: string
}
//