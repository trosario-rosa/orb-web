import { Box } from "@mui/material"
import TopBar from "./components/TopBar/TopBar"
import Footer from "./components/layout/Footer"

export default function App() {
  return (
    <Box className="flex flex-col h-dvh">
      <TopBar />
      <Box className="flex-1 min-h-0 overflow-auto">{/* Content */}</Box>
      <Footer />
    </Box>
  )
}
