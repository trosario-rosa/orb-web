import { Avatar, IconButton, Menu, MenuItem, Tooltip } from "@mui/material"
import { SETTINGS } from "../../app/navigation"
import { useMenuAnchor } from "../../hooks/useMenuAnchor"
import { NavLink } from "react-router"

const USER = { name: "Remy Sharp", avatarUrl: undefined as string | undefined }

export default function UserMenu() {
  const menu = useMenuAnchor()

  return (
    <div>
      <Tooltip title="Open settings">
        <IconButton
          className=""
          aria-label="Open user settings"
          aria-controls={menu.isOpen ? "user-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={menu.isOpen}
          onClick={menu.open}
        >
          <Avatar className="size-8" alt={USER.name} src={USER.avatarUrl} />
        </IconButton>
      </Tooltip>
      <Menu
        id="user-menu"
        anchorEl={menu.anchorEl}
        open={menu.isOpen}
        onClose={menu.close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {SETTINGS.map(({ label, to }) => (
          <MenuItem
            key={label}
            component={NavLink}
            to={to}
            onClick={menu.close}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}
