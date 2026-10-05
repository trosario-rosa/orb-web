import type { GridFilterModel } from "@mui/x-data-grid"
import type { Role, UserStatus } from "../../api/types"
import type { UserQuery } from "../../api/users"

export type UserFilters = Pick<UserQuery, "role" | "status" | "q">

export const MAX_SEARCH_LENGTH = 254

function valuesFor(model: GridFilterModel, field: "role" | "status") {
  const values = model.items
    .filter((item) => item.field === field)
    .flatMap((item) => (Array.isArray(item.value) ? item.value : [item.value]))
    .filter((value): value is string => Boolean(value))

  return values.length > 0 ? [...new Set(values)] : undefined
}

export function toUserFilters(model: GridFilterModel): UserFilters {
  return {
    role: valuesFor(model, "role") as Role[] | undefined,
    status: valuesFor(model, "status") as UserStatus[] | undefined,
    query: model.quickFilterValues?.[0],
  }
}
