import { Box, Snackbar } from "@mui/material"
import ErrorBanner from "../../components/feedback/ErrorBanner"
import EditUserDialog from "./components/EditUserDialog"
import NewUserDialog from "./components/NewUserDialog"
import UsersGrid from "./components/UsersGrid"
import { useRowSelection } from "./hooks/useRowSelection"
import { useUserEditing } from "./hooks/useUserEditing"
import { useUserList } from "./hooks/useUserList"

export default function UsersPage() {
  const list = useUserList()
  const selection = useRowSelection()
  const editing = useUserEditing(list.reload)

  return (
    <Box className="flex flex-col h-full gap-4 p-4">
      <ErrorBanner
        message={list.error ?? editing.error}
        onRetry={list.reload}
      />
      <Box className="flex-1 min-h-0">
        <UsersGrid
          list={list}
          selection={selection}
          onAddUser={editing.startCreate}
          onEditUser={() => editing.startEdit(selection.singleId)}
        />
      </Box>
      <NewUserDialog
        open={editing.creating}
        onClose={editing.cancelCreate}
        onCreate={editing.create}
      />
      <EditUserDialog
        open={editing.editing !== null}
        user={editing.editing}
        onClose={editing.cancelEdit}
        onSave={editing.save}
        onReload={editing.reloadEditing}
      />
      <Snackbar
        open={editing.notice !== null}
        message={editing.notice}
        autoHideDuration={4000}
        onClose={editing.dismissNotice}
      />
    </Box>
  )
}
