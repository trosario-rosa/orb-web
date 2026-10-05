import { request, requestJson } from "./client"
import type { Role, User, UserDraft, UserStatus, Versioned } from "./types"

type UserPayload = {
  id: string
  first_name: string
  last_name: string
  email: string
  role: Role
  status: UserStatus
  created_at: string
  updated_at: string
  last_login: string | null
}

type UserWritePayload = Pick<
  UserPayload,
  "first_name" | "last_name" | "email" | "role" | "status"
>

const toUser = (payload: UserPayload): User => ({
  id: payload.id,
  firstName: payload.first_name,
  lastName: payload.last_name,
  email: payload.email,
  role: payload.role,
  status: payload.status,
  createdAt: new Date(payload.created_at),
  updatedAt: new Date(payload.updated_at),
  lastLogin: payload.last_login ? new Date(payload.last_login) : null,
})

const toPayload = (draft: UserDraft): UserWritePayload => ({
  first_name: draft.firstName,
  last_name: draft.lastName,
  email: draft.email,
  role: draft.role,
  status: draft.status,
})

const toSnakeCase = (field: string) =>
  field.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

async function readUser(response: Response): Promise<Versioned<User>> {
  const payload = (await response.json()) as UserPayload
  return { data: toUser(payload), etag: response.headers.get("ETag") }
}

export type UserQuery = {
  skip?: number
  limit?: number
  sortBy?: keyof User
  direction?: "ascending" | "descending"
  role?: Role[]
  status?: UserStatus[]
  query?: string
}

export type UserPage = {
  items: User[]
  total: number
}

export async function listUsers(
  query: UserQuery = {},
  signal?: AbortSignal
): Promise<UserPage> {
  const params = new URLSearchParams()
  if (query.skip !== undefined) {
    params.set("skip", String(query.skip))
  }
  if (query.limit !== undefined) {
    params.set("limit", String(query.limit))
  }
  if (query.sortBy) {
    params.set("sortBy", toSnakeCase(query.sortBy))
    params.set("direction", query.direction ?? "ascending")
  }
  if (query.query?.trim()) {
    params.set("q", query.query.trim())
  }
  for (const role of query.role ?? []) {
    params.append("role", role)
  }
  for (const status of query.status ?? []) {
    params.append("status", status)
  }

  const page = await requestJson<{ items: UserPayload[]; total: number }>(
    `/users?${params}`,
    { signal }
  )
  return { items: page.items.map(toUser), total: page.total }
}

export async function getUser(
  id: string,
  signal?: AbortSignal
): Promise<Versioned<User>> {
  return readUser(await request(`/user/${id}`, { signal }))
}

export async function createUser(draft: UserDraft): Promise<Versioned<User>> {
  return readUser(
    await request("/user", { method: "POST", body: toPayload(draft) })
  )
}

export async function updateUser(
  id: string,
  draft: UserDraft,
  etag: string
): Promise<Versioned<User>> {
  return readUser(
    await request(`/user/${id}`, {
      method: "PUT",
      body: toPayload(draft),
      headers: { "If-Match": etag },
    })
  )
}

export async function requestPasswordReset(id: string): Promise<string> {
  const { message } = await requestJson<{ message: string }>(
    `/user/${id}/password-reset`,
    { method: "POST" }
  )
  return message
}
