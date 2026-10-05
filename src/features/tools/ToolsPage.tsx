import { useState } from "react"
import { Box, Snackbar } from "@mui/material"
import ExportUsersCard from "./components/ExportUsersCard"
import GenerateUsersCard from "./components/GenerateUsersCard"
import ImportUsersCard from "./components/ImportUsersCard"
import ResetUsersCard from "./components/ResetUsersCard"

export default function ToolsPage() {
  const [notice, setNotice] = useState<string | null>(null)

  return (
    <Box className="flex flex-col gap-4 p-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <GenerateUsersCard onFinished={setNotice} />
        <ImportUsersCard onFinished={setNotice} />
        <ExportUsersCard />
        <ResetUsersCard onFinished={setNotice} />
      </div>

      <Snackbar
        open={notice !== null}
        message={notice}
        autoHideDuration={6000}
        onClose={() => setNotice(null)}
      />
    </Box>
  )
}
