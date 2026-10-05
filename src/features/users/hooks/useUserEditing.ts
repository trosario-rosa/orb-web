import { useCallback, useState } from "react"
import { ApiError, describeError } from "../../../api/client"
import {
  Status,
  type User,
  type UserDraft,
  type Versioned,
} from "../../../api/types"
import { createUser, getUser, updateUser } from "../../../api/users"

export type UserEditingState = {
  creating: boolean
  startCreate: () => void
  cancelCreate: () => void
  create: (draft: UserDraft) => Promise<void>
  editing: User | null
  startEdit: (id: string | null) => Promise<void>
  cancelEdit: () => void
  save: (id: string, draft: UserDraft) => Promise<void>
  reloadEditing: () => Promise<User>
  error: string | null
  notice: string | null
  dismissNotice: () => void
}

export function useUserEditing(onChanged: () => void): UserEditingState {
  const [creating, setCreating] = useState(false)
  const [target, setTarget] = useState<Versioned<User> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const create = useCallback(
    async (draft: UserDraft) => {
      const { data } = await createUser(draft)
      setNotice(`Created ${data.firstName} ${data.lastName}.`)
      onChanged()
    },
    [onChanged]
  )

  const startEdit = useCallback(async (id: string | null) => {
    if (id === null) {
      return
    }
    try {
      setTarget(await getUser(id))
      setError(null)
    } catch (cause) {
      setError(describeError(cause))
    }
  }, [])

  const reloadEditing = useCallback(async () => {
    if (!target) {
      throw new ApiError(Status.NotFound, "There is no user open to reload.")
    }
    const fresh = await getUser(target.data.id)
    setTarget(fresh)
    return fresh.data
  }, [target])

  const save = useCallback(
    async (id: string, draft: UserDraft) => {
      if (!target?.etag) {
        throw new ApiError(
          Status.PreconditionRequired,
          "This user was loaded without a version."
        )
      }
      const { data } = await updateUser(id, draft, target.etag)
      setNotice(`Saved changes to ${data.firstName} ${data.lastName}.`)
      onChanged()
    },
    [target, onChanged]
  )

  return {
    creating,
    startCreate: useCallback(() => setCreating(true), []),
    cancelCreate: useCallback(() => setCreating(false), []),
    create,
    editing: target?.data ?? null,
    startEdit,
    cancelEdit: useCallback(() => setTarget(null), []),
    save,
    reloadEditing,
    error,
    notice,
    dismissNotice: useCallback(() => setNotice(null), []),
  }
}
