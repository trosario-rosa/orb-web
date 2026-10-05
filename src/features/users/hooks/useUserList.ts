import { useCallback, useEffect, useState } from "react"
import type {
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid"
import { describeError } from "../../../api/client"
import type { User } from "../../../api/types"
import { listUsers } from "../../../api/users"
import { toUserFilters } from "../userFilters"

export type UserListState = {
  rows: User[]
  rowCount: number
  loading: boolean
  error: string | null
  pagination: GridPaginationModel
  onPaginationChange: (model: GridPaginationModel) => void
  sort: GridSortModel
  onSortChange: (model: GridSortModel) => void
  filter: GridFilterModel
  onFilterChange: (model: GridFilterModel) => void
  reload: () => void
}

const INITIAL_PAGINATION: GridPaginationModel = { page: 0, pageSize: 25 }
const INITIAL_FILTER: GridFilterModel = { items: [] }

export function useUserList(): UserListState {
  const [rows, setRows] = useState<User[]>([])
  const [rowCount, setRowCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState(INITIAL_PAGINATION)
  const [sort, setSort] = useState<GridSortModel>([])
  const [filter, setFilter] = useState(INITIAL_FILTER)

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true)
      try {
        const page = await listUsers(
          {
            skip: pagination.page * pagination.pageSize,
            limit: pagination.pageSize,
            sortBy: sort[0]?.field as keyof User | undefined,
            direction: sort[0]?.sort === "desc" ? "descending" : "ascending",
            ...toUserFilters(filter),
          },
          signal
        )
        setRows(page.items)
        setRowCount(page.total)
        setError(null)
      } catch (cause) {
        if (!signal?.aborted) {
          setError(describeError(cause))
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false)
        }
      }
    },
    [pagination, sort, filter]
  )

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  return {
    rows,
    rowCount,
    loading,
    error,
    pagination,
    onPaginationChange: setPagination,
    sort,
    onSortChange: setSort,
    filter,
    onFilterChange: useCallback((model: GridFilterModel) => {
      setFilter(model)
      setPagination((current) => ({ ...current, page: 0 }))
    }, []),
    reload: useCallback(() => {
      load()
    }, [load]),
  }
}
