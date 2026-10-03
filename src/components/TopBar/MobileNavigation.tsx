import { IconButton, Menu, MenuItem } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import { useMenuAnchor } from "../../hooks/useMenuAnchor"
import { PAGES } from "./navigation"

export default function MobileNavigation() {
  const menu = useMenuAnchor()

  return (
    <div className="md:hidden">
      <IconButton
        size="large"
        color="inherit"
        aria-label="Open navigation"
        aria-controls={menu.isOpen ? "nav-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={menu.isOpen}
        onClick={menu.open}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id="nav-menu"
        anchorEl={menu.anchorEl}
        open={menu.isOpen}
        onClose={menu.close}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {PAGES.map(({ label, href }) => (
          <MenuItem key={label} component="a" href={href} onClick={menu.close}>
            {label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}
