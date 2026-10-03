import { Button } from "@mui/material"
import { PAGES } from "../../app/navigation"
import { NavLink } from "react-router"

export default function DesktopNavigation() {
  return (
    <nav className="hidden flex-1 md:flex">
      {PAGES.map(({ label, to }) => (
        <Button component={NavLink} key={label} to={to} color="inherit">
          {label}
        </Button>
      ))}
    </nav>
  )
}
