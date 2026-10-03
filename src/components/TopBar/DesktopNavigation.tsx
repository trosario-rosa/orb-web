import { Button } from "@mui/material"
import { PAGES } from "./navigation"

export default function DesktopNavigation() {
  return (
    <nav className="hidden flex-1 md:flex">
      {PAGES.map(({ label, href }) => (
        <Button key={label} href={href} color="inherit">
          {label}
        </Button>
      ))}
    </nav>
  )
}
