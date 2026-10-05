import { useId, useRef, useState } from "react"
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material"
import { isStaleVersionError } from "../../../api/client"
import { Role, type UserDraft, UserStatus } from "../../../api/types"
import {
  type FieldErrors,
  normalizeUserDraft,
  validateUserDraft,
  type ValidatedField,
} from "../userValidation"

declare module "@mui/material/Dialog" {
  interface DialogPaperSlotPropsOverrides {
    noValidate?: boolean
  }
}

type UserFormDialogProps = {
  open: boolean
  title: string
  description: string
  submitLabel: string
  initialDraft: UserDraft
  onClose: () => void
  onSubmit: (draft: UserDraft) => Promise<void> | void
  onReload?: () => Promise<UserDraft>
}

type SubmitFailure = {
  message: string
  canReload: boolean
}

export default function UserFormDialog({
  open,
  title,
  description,
  submitLabel,
  initialDraft,
  onClose,
  onSubmit,
  onReload,
}: UserFormDialogProps) {
  const [draft, setDraft] = useState<UserDraft>(initialDraft)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [failure, setFailure] = useState<SubmitFailure | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [reloading, setReloading] = useState(false)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  const change = (patch: Partial<UserDraft>) => {
    setDraft((current) => ({ ...current, ...patch }))
    setErrors((current) => {
      const next = { ...current }
      for (const field of Object.keys(patch)) {
        delete next[field as ValidatedField]
      }
      return next
    })
  }

  const close = () => {
    if (submitting || reloading) {
      return
    }
    onClose()
  }

  const reload = async () => {
    if (!onReload) {
      return
    }

    setReloading(true)
    try {
      setDraft(await onReload())
      setErrors({})
      setFailure(null)
      setNotice("Reloaded. Fields have been updated to reflect current values.")
      firstFieldRef.current?.focus()
    } catch (cause) {
      setFailure({
        message:
          cause instanceof Error ? cause.message : "Could not reload the user",
        canReload: true,
      })
    } finally {
      setReloading(false)
    }
  }

  const submit = async (event: React.SubmitEvent<HTMLDivElement>) => {
    event.preventDefault()

    const nextErrors = validateUserDraft(draft)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setFailure(null)
    setNotice(null)
    setSubmitting(true)
    try {
      await onSubmit(normalizeUserDraft(draft))
      onClose()
    } catch (cause) {
      setFailure({
        message:
          cause instanceof Error ? cause.message : "Could not save the user",
        canReload: isStaleVersionError(cause),
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: { component: "form", onSubmit: submit, noValidate: true },
        transition: {
          onEnter: () => {
            setDraft(initialDraft)
            setErrors({})
            setFailure(null)
            setNotice(null)
          },
          onEntered: () => firstFieldRef.current?.focus(),
        },
      }}
    >
      <DialogTitle id={titleId}>{title}</DialogTitle>
      <DialogContent className="flex flex-col gap-4">
        <DialogContentText id={descriptionId}>{description}</DialogContentText>
        {failure && (
          <Alert
            severity="error"
            role="alert"
            action={
              failure.canReload && onReload ? (
                <Button
                  color="inherit"
                  size="small"
                  loading={reloading}
                  onClick={reload}
                >
                  Reload User
                </Button>
              ) : undefined
            }
          >
            {failure.message}
          </Alert>
        )}
        {notice && (
          <Alert severity="info" role="status">
            {notice}
          </Alert>
        )}
        <div className="flex flex-col gap-4 sm:flex-row">
          <TextField
            name="firstName"
            label="First name"
            value={draft.firstName}
            onChange={(event) => change({ firstName: event.target.value })}
            error={Boolean(errors.firstName)}
            helperText={errors.firstName}
            autoComplete="off"
            required
            fullWidth
            inputRef={firstFieldRef}
          />
          <TextField
            name="lastName"
            label="Last name"
            value={draft.lastName}
            onChange={(event) => change({ lastName: event.target.value })}
            error={Boolean(errors.lastName)}
            helperText={errors.lastName}
            autoComplete="off"
            required
            fullWidth
          />
        </div>
        <TextField
          name="email"
          type="email"
          label="Email address"
          value={draft.email}
          onChange={(event) => change({ email: event.target.value })}
          error={Boolean(errors.email)}
          helperText={errors.email}
          autoComplete="off"
          required
          fullWidth
        />
        <div className="flex flex-col gap-4 sm:flex-row">
          <TextField
            select
            name="role"
            label="Role"
            value={draft.role}
            onChange={(event) => change({ role: event.target.value as Role })}
            fullWidth
          >
            {Object.values(Role).map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            name="status"
            label="Status"
            value={draft.status}
            onChange={(event) =>
              change({ status: event.target.value as UserStatus })
            }
            fullWidth
          >
            {Object.values(UserStatus).map((status) => (
              <MenuItem
                key={status}
                value={status}
                sx={{ textTransform: "capitalize" }}
              >
                {status}
              </MenuItem>
            ))}
          </TextField>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" loading={submitting}>
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
