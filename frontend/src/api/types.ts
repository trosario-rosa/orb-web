export enum Role {
  Admin = "Admin",
  Member = "Member",
  Viewer = "Viewer",
}

export enum UserStatus {
  Active = "active",
  Invited = "invited",
  Suspended = "suspended",
}

export enum Status {
  Success = 200,
  Created = 201,
  Accepted = 202,
  BadRequest = 400,
  NotFound = 404,
  Conflict = 409,
  PreconditionFail = 412,
  PreconditionRequired = 428,
}

export type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  status: UserStatus
  createdAt: Date
  updatedAt: Date
  lastLogin: Date | null
}

export type UserDraft = Pick<
  User,
  "firstName" | "lastName" | "email" | "role" | "status"
>

export type Versioned<T> = {
  data: T
  etag: string | null
}
