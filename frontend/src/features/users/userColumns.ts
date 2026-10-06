import {
  getGridSingleSelectOperators,
  type GridColDef,
  type GridColumnVisibilityModel,
} from "@mui/x-data-grid"
import { Role, type User, UserStatus } from "../../api/types"

const setOperators = getGridSingleSelectOperators().filter(({ value }) =>
  ["is", "isAnyOf"].includes(value)
)

export const userColumns: GridColDef<User>[] = [
  // Exposing UUIDs make sense if the app goes on to refer to users by their id
  {
    field: "id",
    headerName: "ID",
    width: 190,
    filterable: false,
  },
  {
    field: "firstName",
    headerName: "First name",
    width: 150,
    filterable: false,
  },
  {
    field: "lastName",
    headerName: "Last name",
    width: 150,
    filterable: false,
  },
  {
    field: "email",
    headerName: "Email Address",
    width: 220,
    filterable: false,
  },
  {
    field: "role",
    headerName: "Role",
    type: "singleSelect",
    valueOptions: Object.values(Role),
    filterOperators: setOperators,
    width: 120,
  },
  {
    field: "status",
    headerName: "Status",
    type: "singleSelect",
    valueOptions: Object.values(UserStatus),
    filterOperators: setOperators,
    width: 130,
  },
  {
    field: "createdAt",
    headerName: "Created At",
    type: "dateTime",
    width: 180,
    filterable: false,
  },
  {
    field: "updatedAt",
    headerName: "Updated At",
    type: "dateTime",
    width: 180,
    filterable: false,
  },
  {
    field: "lastLogin",
    headerName: "Last Login",
    type: "dateTime",
    width: 180,
    filterable: false,
  },
]

export const INITIAL_COLUMN_VISIBILITY: GridColumnVisibilityModel = {
  id: false,
}
