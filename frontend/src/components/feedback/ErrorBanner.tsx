import { Alert, Button } from "@mui/material"

type ErrorBannerProps = {
  message: string | null
  onRetry?: () => void
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  if (!message) {
    return null
  }

  return (
    <Alert
      severity="error"
      role="alert"
      action={
        onRetry && (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        )
      }
    >
      {message}
    </Alert>
  )
}
