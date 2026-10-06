import { useRef, useState } from "react"
import { Button, LinearProgress, TextField, Typography } from "@mui/material"
import { generateUsers } from "../../../api/admin"
import { describeError } from "../../../api/client"
import ErrorBanner from "../../../components/feedback/ErrorBanner"
import ToolCard from "./ToolCard"

const DEFAULT_COUNT = 1000

type GenerateUsersCardProps = {
  onFinished: (message: string) => void
}

export default function GenerateUsersCard({
  onFinished,
}: GenerateUsersCardProps) {
  const [count, setCount] = useState(String(DEFAULT_COUNT))
  const [generated, setGenerated] = useState<number | null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const requested = Number(count)
  const valid = Number.isInteger(requested) && requested > 0

  const run = async () => {
    const controller = new AbortController()
    abortRef.current = controller
    setRunning(true)
    setError(null)
    setGenerated(0)

    try {
      const result = await generateUsers(
        requested,
        ({ generated: done }) => setGenerated(done),
        controller.signal
      )
      onFinished(`Generated ${result.generated.toLocaleString()} users.`)
    } catch (cause) {
      if (!controller.signal.aborted) {
        setError(describeError(cause))
      }
    } finally {
      abortRef.current = null
      setRunning(false)
      setGenerated(null)
    }
  }

  const percent =
    generated !== null && valid
      ? Math.min(100, Math.round((generated / requested) * 100))
      : 0

  return (
    <ToolCard
      title="Generate"
      actions={
        running ? (
          <Button color="inherit" onClick={() => abortRef.current?.abort()}>
            Stop
          </Button>
        ) : (
          <Button variant="contained" disabled={!valid} onClick={run}>
            Generate
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-3">
        <TextField
          label="Count"
          type="number"
          value={count}
          onChange={(event) => setCount(event.target.value)}
          error={count !== "" && !valid}
          helperText={
            count !== "" && !valid ? "Enter a number greater than 0." : " "
          }
          disabled={running}
          slotProps={{ htmlInput: { min: 1, step: 100 } }}
          size="small"
        />
        {running && (
          <div className="flex flex-col gap-1">
            <LinearProgress
              variant="determinate"
              value={percent}
              aria-label="Generating users"
              aria-valuenow={percent}
              aria-valuetext={`${percent}% complete`}
            />
            <Typography variant="body2" role="status">
              {`Generated ${(generated ?? 0).toLocaleString()} of ${requested.toLocaleString()}.`}
            </Typography>
          </div>
        )}
        <ErrorBanner message={error} />
      </div>
    </ToolCard>
  )
}
