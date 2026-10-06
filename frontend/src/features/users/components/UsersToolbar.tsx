import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import FilterListIcon from "@mui/icons-material/FilterList"
import ViewColumnIcon from "@mui/icons-material/ViewColumn"
import { Badge, Divider, Tooltip, Typography } from "@mui/material"
import {
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  Toolbar,
  ToolbarButton,
} from "@mui/x-data-grid"
import UsersQuickFilter from "./UsersQuickFilter"

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    onAddUser: () => void
    onEditUser: () => void
    canEditUser: boolean
  }
}

export type UsersToolbarProps = {
  onAddUser: () => void
  onEditUser: () => void
  canEditUser: boolean
}

export default function UsersToolbar({
  onAddUser,
  onEditUser,
  canEditUser,
}: UsersToolbarProps) {
  return (
    <Toolbar>
      <Typography
        component="h1"
        sx={{ fontWeight: "medium", flex: 1, mx: 0.5 }}
      >
        Users
      </Typography>
      <Tooltip title={canEditUser ? "Edit user" : "Select user to edit"}>
        <ToolbarButton
          aria-label="Edit user"
          aria-disabled={!canEditUser}
          style={{ opacity: canEditUser ? 1 : 0.38 }}
          onClick={() => canEditUser && onEditUser()}
        >
          <EditIcon fontSize="small" />
        </ToolbarButton>
      </Tooltip>
      <Tooltip title="Add user">
        <ToolbarButton aria-label="Add user" onClick={onAddUser}>
          <AddIcon fontSize="small" />
        </ToolbarButton>
      </Tooltip>
      <Divider
        orientation="vertical"
        variant="middle"
        flexItem
        sx={{ mx: 0.5 }}
      />
      <Tooltip title="Columns">
        <ColumnsPanelTrigger render={<ToolbarButton aria-label="Columns" />}>
          <ViewColumnIcon fontSize="small" />
        </ColumnsPanelTrigger>
      </Tooltip>
      <Tooltip title="Filters">
        <FilterPanelTrigger
          render={(props, state) => (
            <ToolbarButton {...props} color="default" aria-label="Filters">
              <Badge
                badgeContent={state.filterCount}
                color="primary"
                variant="dot"
              >
                <FilterListIcon fontSize="small" />
              </Badge>
            </ToolbarButton>
          )}
        />
      </Tooltip>
      <Divider
        orientation="vertical"
        variant="middle"
        flexItem
        sx={{ mx: 0.5 }}
      />
      <UsersQuickFilter />
    </Toolbar>
  )
}
