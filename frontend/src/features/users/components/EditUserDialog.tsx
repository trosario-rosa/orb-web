import { useMemo } from "react"
import type { User, UserDraft } from "../../../api/types"
import { EMPTY_DRAFT } from "../userValidation"
import UserFormDialog from "./UserFormDialog"

type EditUserDialogProps = {
  open: boolean
  user: User | null
  onClose: () => void
  onSave: (id: string, draft: UserDraft) => Promise<void> | void
  onReload: () => Promise<User>
}

const toDraft = (user: User): UserDraft => ({
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  status: user.status,
})

export default function EditUserDialog({
  open,
  user,
  onClose,
  onSave,
  onReload,
}: EditUserDialogProps) {
  const initialDraft = useMemo<UserDraft>(
    () => (user ? toDraft(user) : EMPTY_DRAFT),
    [user]
  )

  return (
    <UserFormDialog
      open={open && user !== null}
      title="Edit user"
      description=""
      submitLabel="Save changes"
      initialDraft={initialDraft}
      onClose={onClose}
      onSubmit={(draft) => (user ? onSave(user.id, draft) : undefined)}
      onReload={async () => toDraft(await onReload())}
    />
  )
}
