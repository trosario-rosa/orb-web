import { useState } from "react"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import { Button, Typography } from "@mui/material"
import { type ImportResult, importUsers } from "../../../api/admin"
import { describeError } from "../../../api/client"
import ErrorBanner from "../../../components/feedback/ErrorBanner"
import ImportResultSummary from "./ImportResultSummary"
import ToolCard from "./ToolCard"

type ImportUsersCardProps = {
  onFinished: (message: string) => void
}

export default function ImportUsersCard({ onFinished }: ImportUsersCardProps) {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    if (!file) {
      return
    }

    setUploading(true)
    setError(null)
    setResult(null)
    try {
      const imported = await importUsers(file)
      setResult(imported)
      onFinished(
        `Imported ${imported.created.toLocaleString()} new and ${imported.updated.toLocaleString()} updated users.`
      )
    } catch (cause) {
      setError(describeError(cause))
    } finally {
      setUploading(false)
    }
  }

  return (
    <ToolCard
      title="Import"
      actions={
        <Button
          variant="contained"
          disabled={!file}
          loading={uploading}
          onClick={run}
        >
          Import
        </Button>
      }
    >
      <div className="flex flex-col items-start gap-3">
        <Button
          component="label"
          variant="outlined"
          startIcon={<UploadFileIcon />}
          disabled={uploading}
        >
          Upload File
          <input
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null)
              setResult(null)
            }}
          />
        </Button>
        <Typography variant="body2" role="status">
          {file ? file.name : "No file chosen."}
        </Typography>
        <ErrorBanner message={error} />
        {result && <ImportResultSummary result={result} />}
      </div>
    </ToolCard>
  )
}
