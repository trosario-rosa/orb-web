import * as React from "react"
import * as ReactDOM from "react-dom/client"
import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"
import "./index.css"
import App from "./App.tsx"
import theme from "./app/theme.ts"
import GlobalStyles from "@mui/material/GlobalStyles"
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles"

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element #root was not found")
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <StyledEngineProvider enableCssLayer>
      <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </StyledEngineProvider>
  </React.StrictMode>
)
