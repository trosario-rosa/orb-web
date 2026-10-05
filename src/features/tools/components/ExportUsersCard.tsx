import DownloadIcon from "@mui/icons-material/Download"
import { Button } from "@mui/material"
import { exportUsersUrl } from "../../../api/admin"
import ToolCard from "./ToolCard"

export default function ExportUsersCard() {
  return (
    <ToolCard
      title="Export users"
      actions={
        <Button
          component="a"
          href={exportUsersUrl()}
          download
          variant="contained"
          startIcon={<DownloadIcon />}
        >
          Download CSV
        </Button>
      }
    ></ToolCard>
  )
}
