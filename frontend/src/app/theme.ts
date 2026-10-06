import { createTheme } from "@mui/material/styles"

const theme = createTheme({
  cssVariables: true,
  typography: {
    button: {
      textTransform: "none",
    },
  },
})

export default theme
