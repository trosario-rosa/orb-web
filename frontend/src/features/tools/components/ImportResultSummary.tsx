import {
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import type { ImportResult } from "../../../api/admin"

type ImportResultSummaryProps = {
  result: ImportResult
}

export default function ImportResultSummary({
  result,
}: ImportResultSummaryProps) {
  const counts = [
    ["Processed", result.processed],
    ["Created", result.created],
    ["Updated", result.updated],
    ["Rejected", result.rejected],
  ] as const

  return (
    <div className="flex w-full flex-col gap-2">
      <Typography variant="body2" role="status">
        {counts
          .map(([label, value]) => `${label} ${value.toLocaleString()}`)
          .join(" · ")}
      </Typography>

      {result.errors.length > 0 && (
        <>
          <Alert severity="warning">
            {`${result.rejected.toLocaleString()} ${result.rejected === 1 ? "row" : "rows"} skipped.`}
          </Alert>
          <div className="max-h-56 w-full overflow-auto">
            <Table size="small" aria-label="Skipped rows">
              <TableHead>
                <TableRow>
                  <TableCell>Row</TableCell>
                  <TableCell>Skip Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.errors.map(({ row, message }) => (
                  <TableRow key={`${row}-${message}`}>
                    <TableCell>{row}</TableCell>
                    <TableCell>{message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {result.errorsTruncated > 0 && (
            <Typography variant="caption" color="text.secondary">
              {`${result.errorsTruncated.toLocaleString()} further errors were not reported.`}
            </Typography>
          )}
        </>
      )}
    </div>
  )
}
