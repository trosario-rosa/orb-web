import { useState } from "react"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material"
import { resetUsers } from "../../../api/admin"
import { describeError } from "../../../api/client"
import ErrorBanner from "../../../components/feedback/ErrorBanner"
import ToolCard from "./ToolCard"

type ResetUsersCardProps = {
  onFinished: (message: string) => void
}

export default function ResetUsersCard({ onFinished }: ResetUsersCardProps) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    setDeleting(true)
    setError(null)
    try {
      const { deleted } = await resetUsers()
      setConfirming(false)
      onFinished(`Deleted ${deleted.toLocaleString()} users.`)
    } catch (cause) {
      setError(describeError(cause))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <ToolCard
      title="Reset"
      description=""
      actions={
        <Button
          color="error"
          variant="outlined"
          onClick={() => setConfirming(true)}
        >
          Delete all users
        </Button>
      }
    >
      <Dialog
        open={confirming}
        onClose={() => !deleting && setConfirming(false)}
        aria-labelledby="reset-users-title"
        aria-describedby="reset-users-description"
      >
        <DialogTitle id="reset-users-title">Delete all users?</DialogTitle>
        <DialogContent>
          <DialogContentText id="reset-users-description">
            This cannot be undone.
          </DialogContentText>
          {error && (
            <div className="mt-3">
              <ErrorBanner message={error} />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirming(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            loading={deleting}
            onClick={run}
          >
            Delete all users
          </Button>
        </DialogActions>
      </Dialog>
    </ToolCard>
  )
}
