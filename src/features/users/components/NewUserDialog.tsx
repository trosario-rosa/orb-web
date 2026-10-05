import type { UserDraft } from "../../../api/types"
import { EMPTY_DRAFT } from "../userValidation"
import UserFormDialog from "./UserFormDialog"

type NewUserDialogProps = {
  open: boolean
  onClose: () => void
  onCreate: (draft: UserDraft) => Promise<void> | void
}

export default function NewUserDialog({
  open,
  onClose,
  onCreate,
}: NewUserDialogProps) {
  return (
    <UserFormDialog
      open={open}
      title="New user"
      description=""
      submitLabel="Create user"
      initialDraft={EMPTY_DRAFT}
      onClose={onClose}
      onSubmit={onCreate}
    />
  )
}
