import { DataGrid, GridLogicOperator } from "@mui/x-data-grid"
import type { RowSelectionState } from "../hooks/useRowSelection"
import type { UserListState } from "../hooks/useUserList"
import { INITIAL_COLUMN_VISIBILITY, userColumns } from "../userColumns"
import UsersToolbar from "./UsersToolbar"

type UsersGridProps = {
  list: UserListState
  selection: RowSelectionState
  onAddUser: () => void
  onEditUser: () => void
}

export default function UsersGrid({
  list,
  selection,
  onAddUser,
  onEditUser,
}: UsersGridProps) {
  return (
    <DataGrid
      rows={list.rows}
      rowCount={list.rowCount}
      columns={userColumns}
      initialState={{
        columns: { columnVisibilityModel: INITIAL_COLUMN_VISIBILITY },
        density: "compact",
      }}
      loading={list.loading}
      slots={{ toolbar: UsersToolbar }}
      slotProps={{
        toolbar: {
          onAddUser,
          onEditUser,
          canEditUser: selection.singleId !== null,
        },
        filterPanel: { logicOperators: [GridLogicOperator.And] },
      }}
      showToolbar
      disableMultipleRowSelection
      rowSelectionModel={selection.model}
      onRowSelectionModelChange={selection.onModelChange}
      paginationMode="server"
      paginationModel={list.pagination}
      onPaginationModelChange={list.onPaginationChange}
      sortingMode="server"
      sortModel={list.sort}
      onSortModelChange={list.onSortChange}
      filterMode="server"
      filterModel={list.filter}
      onFilterModelChange={list.onFilterChange}
      pageSizeOptions={[25, 50, 100]}
    />
  )
}
